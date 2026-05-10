import { openDB } from "idb";
import type { UserState } from "./reducers/userReducer";

const DB_NAME = "kanri";
const STORE_NAME = "app";
const USER_KEY = "currentUser";

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

