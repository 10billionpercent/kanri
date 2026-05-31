import { openDB } from "idb";
import type { UserState } from "../reducers/userReducer";
import type { AppData, Project, Task, Document } from "../types";
import { syncToGoogleDriveIfConnected } from "../googleDriveAutoSync";

const DB_NAME = "nagare";
const DB_VERSION = 1;
const STORE_NAME = "app";

const USER_KEY = "currentUser";
const TASKS_KEY = "tasks";
const PROJECTS_KEY = "projects";
const DOCS_KEY = "docs";

const dbPromise = openDB(DB_NAME, DB_VERSION, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(STORE_NAME)) {
      db.createObjectStore(STORE_NAME);
    }
  },
});

function getDefaultData(): AppData {
  return {
    user: null,
    projects: [],
    tasks: [],
    docs: [],
  };
}

/* ---------------- USER ---------------- */

export async function saveUser(
  user: UserState,
  options?: { skipSync?: boolean },
): Promise<void> {
  const db = await dbPromise;
  await db.put(STORE_NAME, user, USER_KEY);

  if (!options?.skipSync) {
    syncToGoogleDriveIfConnected();
  }
}

export async function loadUser(): Promise<UserState | null> {
  const db = await dbPromise;
  return (await db.get(STORE_NAME, USER_KEY)) ?? null;
}

export async function clearUser(options?: {
  skipSync?: boolean;
}): Promise<void> {
  const db = await dbPromise;
  await db.delete(STORE_NAME, USER_KEY);

  if (!options?.skipSync) {
    syncToGoogleDriveIfConnected();
  }
}

/* ---------------- TASKS ---------------- */

export async function saveTasks(
  tasks: Task[],
  options?: { skipSync?: boolean },
): Promise<void> {
  const db = await dbPromise;
  await db.put(STORE_NAME, tasks, TASKS_KEY);

  if (!options?.skipSync) {
    syncToGoogleDriveIfConnected();
  }
}

export async function loadTasks(): Promise<Task[]> {
  const db = await dbPromise;
  return (await db.get(STORE_NAME, TASKS_KEY)) ?? [];
}

export async function clearTasks(options?: {
  skipSync?: boolean;
}): Promise<void> {
  const db = await dbPromise;
  await db.delete(STORE_NAME, TASKS_KEY);

  if (!options?.skipSync) {
    syncToGoogleDriveIfConnected();
  }
}

/* ---------------- PROJECTS ---------------- */

export async function saveProjects(
  projects: Project[],
  options?: { skipSync?: boolean },
): Promise<void> {
  const db = await dbPromise;
  await db.put(STORE_NAME, projects, PROJECTS_KEY);

  if (!options?.skipSync) {
    syncToGoogleDriveIfConnected();
  }
}

export async function loadProjects(): Promise<Project[]> {
  const db = await dbPromise;
  return (await db.get(STORE_NAME, PROJECTS_KEY)) ?? [];
}

export async function clearProjects(options?: {
  skipSync?: boolean;
}): Promise<void> {
  const db = await dbPromise;
  await db.delete(STORE_NAME, PROJECTS_KEY);

  if (!options?.skipSync) {
    syncToGoogleDriveIfConnected();
  }
}

/* ---------------- DOCUMENTS ---------------- */

export async function saveDocs(
  docs: Document[],
  options?: { skipSync?: boolean },
): Promise<void> {
  const db = await dbPromise;
  await db.put(STORE_NAME, docs, DOCS_KEY);

  if (!options?.skipSync) {
    syncToGoogleDriveIfConnected();
  }
}

export async function loadDocs(): Promise<Document[]> {
  const db = await dbPromise;
  return (await db.get(STORE_NAME, DOCS_KEY)) ?? [];
}

export async function clearDocs(options?: {
  skipSync?: boolean;
}): Promise<void> {
  const db = await dbPromise;
  await db.delete(STORE_NAME, DOCS_KEY);

  if (!options?.skipSync) {
    syncToGoogleDriveIfConnected();
  }
}

/* ---------------- APP DATA ---------------- */

export async function loadAppData(): Promise<AppData> {
  const [user, projects, tasks, docs] = await Promise.all([
    loadUser(),
    loadProjects(),
    loadTasks(),
    loadDocs(),
  ]);

  return {
    ...getDefaultData(),
    user,
    projects,
    tasks,
    docs,
  };
}

export async function saveAppData(
  data: AppData,
  options?: { skipSync?: boolean },
): Promise<void> {
  const db = await dbPromise;

  await Promise.all([
    db.put(STORE_NAME, data.user, USER_KEY),
    db.put(STORE_NAME, data.projects, PROJECTS_KEY),
    db.put(STORE_NAME, data.tasks, TASKS_KEY),
    db.put(STORE_NAME, data.docs, DOCS_KEY),
  ]);

  if (!options?.skipSync) {
    syncToGoogleDriveIfConnected();
  }
}

/* ---------------- CLEAR ALL ---------------- */

export async function clearAppData(options?: {
  skipSync?: boolean;
}): Promise<void> {
  const db = await dbPromise;

  await Promise.all([
    db.delete(STORE_NAME, USER_KEY),
    db.delete(STORE_NAME, TASKS_KEY),
    db.delete(STORE_NAME, PROJECTS_KEY),
    db.delete(STORE_NAME, DOCS_KEY),
  ]);

  if (!options?.skipSync) {
    syncToGoogleDriveIfConnected();
  }
}
