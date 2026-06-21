import { stripHtml, searchEndpoints } from "../dist/docs.js";

const html = '<p>SMTP <code>1126</code> and <a href="https://samotpravil.ru">link</a></p>';
const text = stripHtml(html);

if (!text.includes("1126") || !text.includes("link")) {
  throw new Error("stripHtml failed");
}

const endpoints = [
  {
    id: "1",
    category: "Стоп-листы",
    name: "Поиск имейла",
    method: "GET",
    url: "https://api.samotpravil.ru/api/v2/stop-list/search",
    description: "search email in stop list",
    examples: [],
  },
];

const found = searchEndpoints(endpoints, "stop-list search", 1);
if (found.length !== 1 || found[0].name !== "Поиск имейла") {
  throw new Error("searchEndpoints failed");
}
