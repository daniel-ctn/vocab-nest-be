import type {
  ApiSuccess,
  AuthResponse,
  DailyPracticeDto,
  GroupCreateRequest,
  GroupDto,
  LoginRequest,
  RegisterRequest,
  ReviewPracticeItemRequest,
  VocabularyCreateRequest,
  VocabularyDto,
  VocabularySearchRequest,
  VocabularySearchResponse,
} from "@vocabnest/contracts";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type RequestOptions<TBody> = {
  token?: string;
  body?: TBody;
  method?: "GET" | "POST" | "PATCH" | "DELETE";
};

export class ApiClientError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: unknown,
  ) {
    super(message);
  }
}

const request = async <TResponse, TBody = undefined>(
  path: string,
  options: RequestOptions<TBody> = {},
) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? "GET",
    headers: {
      "content-type": "application/json",
      ...(options.token ? { authorization: `Bearer ${options.token}` } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const payload = (await response.json()) as
    | ApiSuccess<TResponse>
    | { error: { code: string; message: string; details?: unknown } };

  if (!response.ok || "error" in payload) {
    const error = "error" in payload ? payload.error : undefined;
    throw new ApiClientError(error?.message ?? "API request failed.", error?.code ?? "API_ERROR", error?.details);
  }

  return payload.data;
};

export const apiClient = {
  register: (body: RegisterRequest) =>
    request<AuthResponse, RegisterRequest>("/auth/register", { method: "POST", body }),
  login: (body: LoginRequest) =>
    request<AuthResponse, LoginRequest>("/auth/login", { method: "POST", body }),
  me: (token: string) => request<AuthResponse["user"]>("/auth/me", { token }),
  searchVocabulary: (token: string, body: VocabularySearchRequest) =>
    request<VocabularySearchResponse, VocabularySearchRequest>("/vocabulary/search", {
      token,
      method: "POST",
      body,
    }),
  saveVocabulary: (token: string, body: VocabularyCreateRequest) =>
    request<VocabularyDto, VocabularyCreateRequest>("/vocabulary", {
      token,
      method: "POST",
      body,
    }),
  createGroup: (token: string, body: GroupCreateRequest) =>
    request<GroupDto, GroupCreateRequest>("/groups", { token, method: "POST", body }),
  assignVocabularyGroups: (token: string, vocabularyId: string, groupIds: string[]) =>
    request<VocabularyDto, { groupIds: string[] }>(`/vocabulary/${vocabularyId}/groups`, {
      token,
      method: "POST",
      body: { groupIds },
    }),
  getTodayPractice: (token: string) => request<DailyPracticeDto>("/practice/today", { token }),
  reviewPracticeItem: (
    token: string,
    practiceId: string,
    itemId: string,
    body: ReviewPracticeItemRequest,
  ) =>
    request<DailyPracticeDto["items"][number], ReviewPracticeItemRequest>(
      `/practice/${practiceId}/items/${itemId}/review`,
      { token, method: "POST", body },
    ),
};
