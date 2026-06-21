export interface EndpointExample {
  name: string;
  status?: string;
  code?: number;
  body?: string;
}

export interface EndpointDoc {
  id: string;
  category: string;
  name: string;
  method: string;
  url: string;
  description: string;
  bodyExample?: string;
  examples: EndpointExample[];
}

export interface DocsOverview {
  title: string;
  description: string;
  baseUrl: string;
  auth: string;
  smtpHost: string;
  smtpPorts: string;
  limits: string[];
  categories: string[];
  endpointCount: number;
  docsSource: "live" | "snapshot";
  publishDate?: string;
  syncedAt?: string;
}

export interface PostmanCollection {
  info?: {
    name?: string;
    description?: string;
    publishDate?: string;
  };
  item?: PostmanItem[];
}

export interface PostmanItem {
  name?: string;
  item?: PostmanItem[];
  request?: PostmanRequest;
  response?: PostmanResponse[];
  id?: string;
}

export interface PostmanRequest {
  method?: string;
  url?: string | PostmanUrlObject;
  description?: string;
  body?: {
    mode?: string;
    raw?: string;
  };
  auth?: {
    type?: string;
    apikey?: {
      basicConfig?: Array<{ key?: string; value?: string }>;
    };
  };
}

export interface PostmanUrlObject {
  protocol?: string;
  host?: string[];
  port?: string;
  path?: string[];
}

export interface PostmanResponse {
  name?: string;
  status?: string;
  code?: number;
  body?: string;
}
