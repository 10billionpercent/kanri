const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8787";

function getToken(): string | null {
  return localStorage.getItem("nagare_token");
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `API error: ${res.status}`);
  }
  if (res.status === 204) return {} as T;
  return res.json();
}

// ---------- Auth ----------
export interface User {
  id: string;
  username: string;
  display_name: string | null;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export async function register(
  username: string,
  password: string,
  displayName?: string,
): Promise<AuthResponse> {
  const res = await request<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ username, password, display_name: displayName }),
  });
  localStorage.setItem("nagare_token", res.token);
  return res;
}

export async function login(
  username: string,
  password: string,
): Promise<AuthResponse> {
  const res = await request<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
  localStorage.setItem("nagare_token", res.token);
  return res;
}

export async function logout(): Promise<void> {
  await request("/auth/logout", { method: "POST" });
  localStorage.removeItem("nagare_token");
}

export async function getMe(): Promise<User | null> {
  try {
    return await request<User>("/auth/me");
  } catch {
    return null;
  }
}

// ---------- Projects (backend shape: snake_case, ms timestamps) ----------
export interface BackendProject {
  id: string;
  name: string;
  description: string | null;
  created_at: number; // ms
  updated_at: number;
}

export async function fetchProjects(): Promise<BackendProject[]> {
  return request<BackendProject[]>("/projects");
}

export async function createProject(project: {
  id?: string;
  name: string;
  description?: string;
  createdAt?: number;
  updatedAt?: number;
}): Promise<void> {
  await request("/projects", {
    method: "POST",
    body: JSON.stringify(project),
  });
}

export async function updateProject(
  id: string,
  updates: {
    name?: string;
    description?: string;
    updatedAt?: number;
  },
): Promise<void> {
  await request(`/projects/${id}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });
}

export async function deleteProject(id: string): Promise<void> {
  await request(`/projects/${id}`, { method: "DELETE" });
}

// ---------- Tasks ----------
export interface BackendTask {
  id: string;
  project_id: string;
  name: string;
  description: string | null;
  priority: "high" | "medium" | "low";
  status: "todo" | "doing" | "done";
  created_at: number;
  updated_at: number;
}

export async function fetchTasks(projectId?: string): Promise<BackendTask[]> {
  const query = projectId ? `?projectId=${projectId}` : "";
  return request<BackendTask[]>(`/tasks${query}`);
}

export async function createTask(task: {
  id?: string;
  project_id: string;
  name: string;
  description?: string;
  priority: "high" | "medium" | "low";
  status: "todo" | "doing" | "done";
  created_at?: number;
  updated_at?: number;
}): Promise<void> {
  await request("/tasks", {
    method: "POST",
    body: JSON.stringify(task),
  });
}

export async function updateTask(
  id: string,
  updates: {
    name?: string;
    description?: string;
    priority?: "high" | "medium" | "low";
    status?: "todo" | "doing" | "done";
    updated_at?: number;
  },
): Promise<void> {
  await request(`/tasks/${id}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });
}

export async function deleteTask(id: string): Promise<void> {
  await request(`/tasks/${id}`, { method: "DELETE" });
}

// ---------- Docs (Documents) ----------
export interface BackendDoc {
  id: string;
  project_id: string;
  title: string; // backend uses "title", but frontend Document uses "name"
  content: string | null;
  created_at: number;
  updated_at: number;
}

export async function fetchDocs(projectId?: string): Promise<BackendDoc[]> {
  const query = projectId ? `?projectId=${projectId}` : "";
  return request<BackendDoc[]>(`/docs${query}`);
}

export async function createDoc(doc: {
  id?: string;
  project_id: string;
  title: string;
  content?: string;
  created_at?: number;
  updated_at?: number;
}): Promise<void> {
  await request("/docs", {
    method: "POST",
    body: JSON.stringify(doc),
  });
}

export async function updateDoc(
  id: string,
  updates: {
    title?: string;
    content?: string;
    updated_at?: number;
  },
): Promise<void> {
  await request(`/docs/${id}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });
}

export async function deleteDoc(id: string): Promise<void> {
  await request(`/docs/${id}`, { method: "DELETE" });
}

// ---------- Sync ----------
export interface SyncPayload {
  localProjects: (Omit<BackendProject, "created_at" | "updated_at"> & {
    createdAt: number;
    updatedAt: number;
  })[];
  localTasks: (Omit<BackendTask, "created_at" | "updated_at"> & {
    createdAt: number;
    updatedAt: number;
  })[];
  localDocs: (Omit<BackendDoc, "created_at" | "updated_at"> & {
    createdAt: number;
    updatedAt: number;
  })[];
}

export interface SyncResponse {
  projects: BackendProject[];
  tasks: BackendTask[];
  docs: BackendDoc[];
}

export async function sync(data: SyncPayload): Promise<SyncResponse> {
  return request<SyncResponse>("/sync", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ---------- Phrase ----------
export async function getPhrase(
  bucket: "start" | "continue" | "finish" | "reset",
): Promise<string> {
  const res = await request<{ phrase: string }>(`/phrase/${bucket}`);
  return res.phrase;
}
