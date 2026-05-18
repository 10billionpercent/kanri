import { openDB } from "idb";
import type { UserState } from "./reducers/userReducer";
import type { Project, Task } from "./types";

const DB_NAME = "nagare";
const STORE_NAME = "app";

const USER_KEY = "currentUser";
const TASKS_KEY = "tasks";
const PROJECTS_KEY = "projects";

const dbPromise = openDB(DB_NAME, 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(STORE_NAME)) {
      db.createObjectStore(STORE_NAME);
    }
  },
});

export async function saveUser(user: UserState): Promise<void> {
  const db = await dbPromise;
  await db.put(STORE_NAME, user, USER_KEY);
}

export async function loadUser(): Promise<UserState | null> {
  const db = await dbPromise;
  return (await db.get(STORE_NAME, USER_KEY)) ?? null;
}

export async function clearUser(): Promise<void> {
  const db = await dbPromise;
  await db.delete(STORE_NAME, USER_KEY);
}

export async function saveTasks(tasks: Task[]): Promise<void> {
  const db = await dbPromise;
  await db.put(STORE_NAME, tasks, TASKS_KEY);
}

export async function loadTasks(): Promise<Task[]> {
  const db = await dbPromise;
  return (await db.get(STORE_NAME, TASKS_KEY)) ?? [];
}

export async function clearTasks(): Promise<void> {
  const db = await dbPromise;
  await db.delete(STORE_NAME, TASKS_KEY);
}

export async function saveProjects(projects: Project[]): Promise<void> {
  const db = await dbPromise;
  await db.put(STORE_NAME, projects, PROJECTS_KEY);
}

export async function loadProjects(): Promise<Project[]> {
  const db = await dbPromise;
  return (await db.get(STORE_NAME, PROJECTS_KEY)) ?? [];
}

export async function clearProjects(): Promise<void> {
  const db = await dbPromise;
  await db.delete(STORE_NAME, PROJECTS_KEY);
}

export async function clearAppData(): Promise<void> {
  const db = await dbPromise;

  await Promise.all([
    db.delete(STORE_NAME, USER_KEY),
    db.delete(STORE_NAME, TASKS_KEY),
    db.delete(STORE_NAME, PROJECTS_KEY),
  ]);
}
