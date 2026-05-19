import { uploadBackupToGoogleDrive } from "./googleDrive";

const GOOGLE_ACCESS_TOKEN_KEY = "gdrive-token";

let syncTimeout: number | null = null;

export function syncToGoogleDriveIfConnected(): void {
  const accessToken = localStorage.getItem(GOOGLE_ACCESS_TOKEN_KEY);

  if (!accessToken) {
    return;
  }

  if (syncTimeout !== null) {
    window.clearTimeout(syncTimeout);
  }

  syncTimeout = window.setTimeout(async () => {
    try {
      await uploadBackupToGoogleDrive(accessToken);
      console.log("✅ Auto-synced to Google Drive");
    } catch (error) {
      console.error("❌ Auto-sync failed:", error);
    }
  }, 1500);
}
