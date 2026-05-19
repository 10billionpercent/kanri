import { loadAppData, saveAppData } from "./db";
import type { AppData } from "./types";

export const BACKUP_FILE_NAME = "nagare-backup.json";

function getTimestamp(item: {
  updatedAt?: string;
  lastModified?: string;
}): number {
  const timestamp = item.updatedAt ?? item.lastModified;
  return timestamp ? new Date(timestamp).getTime() : 0;
}

function mergeById<
  T extends {
    id: string;
    updatedAt?: string;
    lastModified?: string;
  }
>(localItems: T[], incomingItems: T[]): T[] {
  const map = new Map<string, T>();

  for (const item of localItems) {
    map.set(item.id, item);
  }

  for (const item of incomingItems) {
    const existing = map.get(item.id);

    if (!existing) {
      map.set(item.id, item);
      continue;
    }

    if (getTimestamp(item) > getTimestamp(existing)) {
      map.set(item.id, item);
    }
  }

  return Array.from(map.values());
}

function mergeAppData(
  localData: AppData,
  incomingData: AppData
): AppData {
  return {
    user: incomingData.user ?? localData.user,
    projects: mergeById(
      localData.projects ?? [],
      incomingData.projects ?? []
    ),
    tasks: mergeById(
      localData.tasks ?? [],
      incomingData.tasks ?? []
    ),
    docs: mergeById(
      localData.docs ?? [],
      incomingData.docs ?? []
    ),
  };
}

export async function exportAppData(): Promise<string> {
  const data = await loadAppData();

  return JSON.stringify(
    {
      ...data,
      exportedAt: new Date().toISOString(),
      version: 1,
    },
    null,
    2
  );
}

export async function importAppData(
  json: string
): Promise<void> {
  const incoming = JSON.parse(json) as Partial<AppData>;
  const local = await loadAppData();

  const merged = mergeAppData(local, {
    user: incoming.user ?? local.user,
    projects: incoming.projects ?? [],
    tasks: incoming.tasks ?? [],
    docs: incoming.docs ?? [],
  });

  await saveAppData(merged, { skipSync: true });
}

export async function downloadBackupFile(): Promise<void> {
  const json = await exportAppData();

  const blob = new Blob([json], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = BACKUP_FILE_NAME;
  a.click();

  URL.revokeObjectURL(url);
}

export async function restoreBackupFile(
  file: File
): Promise<void> {
  const json = await file.text();
  await importAppData(json);
}