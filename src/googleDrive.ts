import {
  exportAppData,
  importAppData,
  BACKUP_FILE_NAME,
} from "./backup";

const DRIVE_UPLOAD_URL =
  "https://www.googleapis.com/upload/drive/v3/files";

const DRIVE_FILES_URL =
  "https://www.googleapis.com/drive/v3/files";

async function findBackupFileId(
  accessToken: string
): Promise<string | null> {
  const query =
    `name='${BACKUP_FILE_NAME}' and ` +
    `'appDataFolder' in parents and trashed=false`;

  const res = await fetch(
    `${DRIVE_FILES_URL}?spaces=appDataFolder&q=${encodeURIComponent(
      query
    )}&fields=files(id,modifiedTime)`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!res.ok) {
    const errorText = await res.text();
    console.error("Find backup failed:", errorText);
    throw new Error("Failed to search Google Drive");
  }

  const data = await res.json();
  return data.files?.[0]?.id ?? null;
}

export async function uploadBackupToGoogleDrive(
  accessToken: string
): Promise<void> {
  const existingFileId =
    await findBackupFileId(accessToken);

  if (existingFileId) {
    const res = await fetch(
      `${DRIVE_FILES_URL}/${existingFileId}?alt=media`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!res.ok) {
      throw new Error(
        "Failed to download existing cloud backup"
      );
    }

    const cloudJson = await res.text();
    await importAppData(cloudJson);
  }

  const mergedJson = await exportAppData();

  const metadata = existingFileId
    ? {}
    : {
        name: BACKUP_FILE_NAME,
        parents: ["appDataFolder"],
      };

  const form = new FormData();

  form.append(
    "metadata",
    new Blob([JSON.stringify(metadata)], {
      type: "application/json",
    })
  );

  form.append(
    "file",
    new Blob([mergedJson], {
      type: "application/json",
    })
  );

  const url = existingFileId
    ? `${DRIVE_UPLOAD_URL}/${existingFileId}?uploadType=multipart`
    : `${DRIVE_UPLOAD_URL}?uploadType=multipart`;

  const method = existingFileId ? "PATCH" : "POST";

  const uploadRes = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: form,
  });

  if (!uploadRes.ok) {
    const errorText = await uploadRes.text();
    console.error("Upload failed:", errorText);
    throw new Error("Failed to upload backup");
  }
}

export async function downloadBackupFromGoogleDrive(
  accessToken: string
): Promise<boolean> {
  const fileId = await findBackupFileId(accessToken);

  if (!fileId) {
    return false;
  }

  const res = await fetch(
    `${DRIVE_FILES_URL}/${fileId}?alt=media`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!res.ok) {
    const errorText = await res.text();
    console.error("Download failed:", errorText);
    throw new Error("Failed to download backup");
  }

  const json = await res.text();
  await importAppData(json);

  return true;
}