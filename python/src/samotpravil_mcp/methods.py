"""SDK method metadata and JSON-schema helpers."""

from __future__ import annotations

import inspect
from dataclasses import dataclass
from typing import Any, Callable, Literal, get_args, get_origin

from samotpravil import SamotpravilClient

MethodCategory = Literal["read", "send", "mutation"]


@dataclass(frozen=True)
class SdkMethod:
    name: str
    category: MethodCategory
    description: str
    whitelabel: bool = False


SDK_METHODS: tuple[SdkMethod, ...] = (
    SdkMethod("send_email", "send", "Единичная отправка письма через SDK"),
    SdkMethod("get_status", "read", "Статус доставки по message_id или x_track_id"),
    SdkMethod("get_ext_status", "read", "Полная история статусов доставки"),
    SdkMethod("get_statistics", "read", "Статистика за период"),
    SdkMethod("get_non_delivery_by_date", "read", "Недоставки за период"),
    SdkMethod("get_non_delivery_by_issue", "read", "Недоставки по номеру выпуска"),
    SdkMethod("get_fbl_report_by_date", "read", "Жалобы FBL за период"),
    SdkMethod("get_fbl_report_by_issue", "read", "Жалобы FBL по номеру выпуска"),
    SdkMethod("stop_list_search", "read", "Поиск email в стоп-листе"),
    SdkMethod("stop_list_add", "mutation", "Добавить email в стоп-лист"),
    SdkMethod("stop_list_remove", "mutation", "Удалить email из стоп-листа"),
    SdkMethod("get_domains", "read", "Список разрешённых доменов"),
    SdkMethod("domain_add", "mutation", "Добавить домен в разрешённые"),
    SdkMethod("domain_remove", "mutation", "Удалить домен из разрешённых"),
    SdkMethod("domain_check_verification", "read", "Проверить верификацию домена"),
    SdkMethod("send_package", "send", "Массовая отправка писем"),
    SdkMethod("send_package_xml", "send", "Массовая отправка через XML по URL"),
    SdkMethod("stop_package", "mutation", "Остановить пакетную отправку"),
    SdkMethod("get_package_status", "read", "Статус пакета"),
    SdkMethod("get_unsubscribe_by_date", "read", "Отписки за период"),
    SdkMethod("get_unsubscribe_by_issue", "read", "Отписки по номеру выпуска"),
    SdkMethod("get_issue_stat", "read", "Статистика по выпускам пакетной отправки"),
    SdkMethod("stop_list_unsubscribe", "read", "Стоп-лист отписавшихся"),
    SdkMethod("stop_list_fbl", "read", "Стоп-лист FBL"),
    SdkMethod("stop_list_failed", "read", "Стоп-лист недоставок"),
    SdkMethod("stop_list_export_create", "mutation", "Создать задачу экспорта стоп-листа"),
    SdkMethod("stop_list_export_tasks", "read", "Список задач экспорта стоп-листа"),
    SdkMethod("stop_list_export_download", "read", "Скачать архив стоп-листа по токену"),
    SdkMethod("stop_list_export_delete", "mutation", "Удалить задачу экспорта стоп-листа"),
    SdkMethod("get_blist", "read", "Информация о рассылке (WhiteLabel)", whitelabel=True),
    SdkMethod("create_blist", "mutation", "Создать рассылку (WhiteLabel)", whitelabel=True),
    SdkMethod("update_blist", "mutation", "Обновить рассылку (WhiteLabel)", whitelabel=True),
    SdkMethod("get_ip_info", "read", "IP-адреса отправки (WhiteLabel)", whitelabel=True),
    SdkMethod("get_authkey", "read", "Информация об API-ключе (WhiteLabel)", whitelabel=True),
    SdkMethod("create_authkey", "mutation", "Создать API-ключ (WhiteLabel)", whitelabel=True),
)

SDK_METHOD_BY_NAME = {method.name: method for method in SDK_METHODS}


def _python_type_to_json_schema(annotation: Any) -> dict[str, Any]:
    if annotation is inspect.Parameter.empty:
        return {"type": "string"}

    origin = get_origin(annotation)
    if origin is list:
        args = get_args(annotation)
        item = _python_type_to_json_schema(args[0]) if args else {"type": "string"}
        return {"type": "array", "items": item}
    if origin is dict:
        return {"type": "object", "additionalProperties": True}

    if annotation is str:
        return {"type": "string"}
    if annotation is int:
        return {"type": "integer"}
    if annotation is float:
        return {"type": "number"}
    if annotation is bool:
        return {"type": "boolean"}

    args = get_args(annotation)
    if args:
        non_none = [arg for arg in args if arg is not type(None)]
        if len(non_none) == 1:
            schema = _python_type_to_json_schema(non_none[0])
            return schema

    return {"type": "string"}


def build_input_schema(method_name: str) -> dict[str, Any]:
    fn = getattr(SamotpravilClient, method_name)
    properties: dict[str, Any] = {
        "dry_run": {
            "type": "boolean",
            "description": "Если true — не вызывать API, вернуть preview",
            "default": False,
        },
        "async_mode": {
            "type": "boolean",
            "description": "Если true — использовать AsyncSamotpravilClient",
            "default": False,
        },
    }
    required: list[str] = []

    for param_name, param in inspect.signature(fn).parameters.items():
        if param_name == "self":
            continue
        properties[param_name] = {
            **_python_type_to_json_schema(param.annotation),
            "description": param_name.replace("_", " "),
        }
        if param.default is inspect.Parameter.empty and param.kind != inspect.Parameter.VAR_KEYWORD:
            required.append(param_name)

    return {
        "type": "object",
        "properties": properties,
        "required": required,
        "additionalProperties": False,
    }


def get_sdk_callable(client: Any, method_name: str) -> Callable[..., Any]:
    return getattr(client, method_name)
