/**
 * Base URL vers l’API Nest (préfixe `/api` côté Nginx).
 * - Navigateur : même origine que le Hub (`/api`) → fonctionne en HTTP/HTTPS sans variable de build.
 * - SSR / Node : `INTERNAL_API_URL` (Docker : http://api:4000/api) ou repli localhost en dev local.
 */
export function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    return "/api";
  }
  return (
    process.env.INTERNAL_API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:4000/api"
  );
}

type ApiEnvelope<TData> = {
  success?: boolean;
  data?: TData;
  error?: {
    code?: string;
    message?: string;
  };
  message?: string | string[];
};

export type CreateGamadIdInput = {
  displayName: string;
  email: string;
  phone: string;
  password: string;
  identityType: string;
};

export type GamadIdListItem = {
  id: string;
  publicCode: string;
  status: string;
  identityType: string;
  displayName: string;
  email: string;
};

export type GamadIdListPayload = {
  items: GamadIdListItem[];
  total: number;
  skip: number;
  take: number;
};

export type CreateOrganizationUnitInput = {
  name: string;
  type: string;
  parentId?: string;
  description?: string;
};

export type CreateDocumentInput = {
  title: string;
  documentType: string;
  classification: string;
  organizationUnitId?: string;
};

export type CreateActivityInput = {
  title: string;
  description: string;
  organizationUnitId: string;
  priority: string;
  startDate: string;
  endDate: string;
};

export class ApiClientError extends Error {
  code: string;
  status: number;

  constructor(message: string, code: string, status: number) {
    super(message);
    this.name = "ApiClientError";
    this.code = code;
    this.status = status;
  }
}

function getActorId(): string | undefined {
  if (typeof window === "undefined") {
    return process.env.NEXT_PUBLIC_GAMAD_ACTOR_ID;
  }
  return window.localStorage.getItem("gamadActorId") ?? process.env.NEXT_PUBLIC_GAMAD_ACTOR_ID;
}

function resolveErrorMessage(payload: ApiEnvelope<unknown>, fallback: string): string {
  if (payload.error?.message) {
    return payload.error.message;
  }
  if (Array.isArray(payload.message)) {
    return payload.message.join(" ");
  }
  if (typeof payload.message === "string") {
    return payload.message;
  }
  return fallback;
}

function resolveErrorCode(response: Response, message: string, payload: ApiEnvelope<unknown>): string {
  if (payload.error?.code) {
    return payload.error.code;
  }
  if (response.status === 401) {
    return "AUTH_REQUIRED";
  }
  if (response.status === 403 || message.toLowerCase().includes("permission")) {
    return "PERMISSION_DENIED";
  }
  return "API_ERROR";
}

function authHeaders(): Record<string, string> {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  const actorId = getActorId();
  if (actorId) {
    h["x-gamad-actor-id"] = actorId;
  }
  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem("gamadAuthToken");
    if (token) {
      h["Authorization"] = `Bearer ${token}`;
    }
  }
  return h;
}

export async function apiRequest<TData>(path: string, init?: RequestInit): Promise<TData> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers: {
      ...authHeaders(),
      ...(init?.headers as Record<string, string> | undefined)
    },
    cache: "no-store"
  });

  const payload = (await response.json().catch(() => ({}))) as ApiEnvelope<TData>;
  if (!response.ok || !payload.success) {
    const message = resolveErrorMessage(payload, "API request failed");
    const code = resolveErrorCode(response, message, payload);
    throw new ApiClientError(message, code, response.status);
  }
  return payload.data as TData;
}

export const identityApi = {
  createGamadId(input: CreateGamadIdInput) {
    return apiRequest("/v1/identity/gamad-ids", {
      method: "POST",
      body: JSON.stringify(input)
    });
  },

  listGamadIds(params?: { skip?: number; take?: number }) {
    const q = new URLSearchParams();
    if (params?.skip !== undefined) {
      q.set("skip", String(params.skip));
    }
    if (params?.take !== undefined) {
      q.set("take", String(params.take));
    }
    const qs = q.toString();
    return apiRequest<GamadIdListPayload>(`/v1/identity/gamad-ids${qs ? `?${qs}` : ""}`);
  }
};

export const organizationApi = {
  createUnit(input: CreateOrganizationUnitInput) {
    return apiRequest("/v1/organization/units", {
      method: "POST",
      body: JSON.stringify(input)
    });
  }
};

export const documentsApi = {
  createDocument(input: CreateDocumentInput) {
    return apiRequest("/v1/documents", {
      method: "POST",
      body: JSON.stringify(input)
    });
  }
};

export const activitiesApi = {
  createActivity(input: CreateActivityInput) {
    return apiRequest("/v1/activities", {
      method: "POST",
      body: JSON.stringify(input)
    });
  }
};
