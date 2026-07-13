/**
 * Zod field hints from Postman example values (scaffold only).
 */
export function zodTypeForValue(value) {
  if (value === null || value === undefined) return "z.unknown().optional()";
  if (typeof value === "string") return "z.string()";
  if (typeof value === "number") return Number.isInteger(value) ? "z.number().int()" : "z.number()";
  if (typeof value === "boolean") return "z.boolean()";
  if (Array.isArray(value)) {
    if (value.length === 0) return "z.array(z.unknown())";
    return `z.array(${zodTypeForValue(value[0])})`;
  }
  if (typeof value === "object") return "z.record(z.string(), z.unknown())";
  return "z.unknown()";
}

export function pathParamsFromTemplate(apiPath) {
  const matches = apiPath.match(/\{([^}]+)\}/g) ?? [];
  return matches.map((token) => token.slice(1, -1));
}

export function toPascal(value) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

export function toCamel(value) {
  const pascal = toPascal(value);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}
