// API transport is centralized so every screen handles ProblemDetails consistently.
const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5166").replace(/\/$/, "");

export class ApiError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message);
    this.name = "ApiError";
  }
}

export interface Period {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
}
export type PeriodInput = Omit<Period, "id">;

export interface Section {
  id: string;
  name: string;
  colorHex: string;
}
export type SectionInput = Omit<Section, "id">;

export interface StaffGroup {
  id: string;
  name: string;
}
export type StaffGroupInput = Omit<StaffGroup, "id">;

export interface User {
  id: string;
  fullName: string;
  email: string;
  isAdmin: boolean;
  isPersonnel: boolean;
}
export type UserInput = Omit<User, "id">;

export interface Employment {
  id: string;
  userId: string;
  sectionId: string;
  staffGroupId: string;
  hoursPerWeek: number;
  startDate: string;
  endDate: string;
}
export type EmploymentInput = Omit<Employment, "id">;

export interface PersonnelRow {
  employmentId: string;
  fullName: string;
  sectionName: string;
  staffGroupName: string;
  hoursPerWeek: number;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${BASE_URL}/api/${path}`, {
      ...options,
      headers: {
        Accept: "application/json",
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new ApiError("Der kunne ikke oprettes forbindelse til API'et. Kontrollér, at backend kører, og at API-adressen er korrekt.");
  }

  if (!response.ok) {
    const payload: unknown = await response.json().catch(() => null);
    const problem = payload as { detail?: string; title?: string; errors?: Record<string, string[]> } | null;
    const validationErrors = problem?.errors && Object.values(problem.errors).flat().join(" ");
    throw new ApiError(
      validationErrors || problem?.detail || problem?.title || `Anmodningen mislykkedes (HTTP ${response.status}).`,
      response.status,
    );
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export interface CrudResource<T extends { id: string }, TInput> {
  list: () => Promise<T[]>;
  get: (id: string) => Promise<T>;
  create: (data: TInput) => Promise<T>;
  update: (id: string, data: TInput) => Promise<T>;
  remove: (id: string) => Promise<void>;
}

function resource<T extends { id: string }, TInput>(path: string): CrudResource<T, TInput> {
  return {
    list: () => request<T[]>(path),
    get: (id) => request<T>(`${path}/${id}`),
    create: (data) => request<T>(path, { method: "POST", body: JSON.stringify(data) }),
    update: (id, data) => request<T>(`${path}/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    remove: (id) => request<void>(`${path}/${id}`, { method: "DELETE" }),
  };
}

export const api = {
  periods: resource<Period, PeriodInput>("periods"),
  sections: resource<Section, SectionInput>("sections"),
  staffGroups: resource<StaffGroup, StaffGroupInput>("staffgroups"),
  users: resource<User, UserInput>("users"),
  employments: resource<Employment, EmploymentInput>("employments"),
  personnel: (periodId: string) =>
    request<PersonnelRow[]>(`personnel?periodId=${encodeURIComponent(periodId)}`),
};
