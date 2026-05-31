// src/services/sync.ts
import {
  loadProjects,
  loadTasks,
  loadDocs,
  saveProjects,
  saveTasks,
  saveDocs,
} from "./db";
import { sync as apiSync } from "./api";
import type { BackendProject, BackendTask, BackendDoc } from "./api";
import type { Project, Task, Document } from "../types";

// Convert frontend (ISO strings, camelCase) -> backend (ms, snake_case)
function projectToBackend(
  project: Project,
): Omit<BackendProject, "created_at" | "updated_at"> & {
  createdAt: number;
  updatedAt: number;
} {
  return {
    id: project.id,
    name: project.name,
    description: project.description ?? null,
    createdAt: new Date(project.createdAt).getTime(),
    updatedAt: new Date(project.updatedAt).getTime(),
  };
}

function taskToBackend(
  task: Task,
): Omit<BackendTask, "created_at" | "updated_at"> & {
  createdAt: number;
  updatedAt: number;
} {
  return {
    id: task.id,
    project_id: task.projectID,
    name: task.name,
    description: task.description ?? null,
    priority: task.priority,
    status: task.status,
    createdAt: new Date(task.createdAt).getTime(),
    updatedAt: new Date(task.updatedAt).getTime(),
  };
}

function docToBackend(
  doc: Document,
): Omit<BackendDoc, "created_at" | "updated_at"> & {
  createdAt: number;
  updatedAt: number;
} {
  return {
    id: doc.id,
    project_id: doc.projectID,
    title: doc.name, // frontend Document uses "name", backend uses "title"
    content: doc.content ?? null,
    createdAt: new Date(doc.createdAt).getTime(),
    updatedAt: new Date(doc.updatedAt).getTime(),
  };
}

// Convert backend (ms, snake_case) -> frontend (ISO strings, camelCase)
function projectToFrontend(backend: BackendProject): Project {
  return {
    id: backend.id,
    name: backend.name,
    description: backend.description ?? undefined,
    createdAt: new Date(backend.created_at).toISOString(),
    updatedAt: new Date(backend.updated_at).toISOString(),
  };
}

function taskToFrontend(backend: BackendTask): Task {
  return {
    id: backend.id,
    projectID: backend.project_id,
    name: backend.name,
    description: backend.description ?? undefined,
    priority: backend.priority,
    status: backend.status,
    createdAt: new Date(backend.created_at).toISOString(),
    updatedAt: new Date(backend.updated_at).toISOString(),
  };
}

function docToFrontend(backend: BackendDoc): Document {
  return {
    id: backend.id,
    projectID: backend.project_id,
    name: backend.title, // backend "title" -> frontend "name"
    content: backend.content ?? "",
    createdAt: new Date(backend.created_at).toISOString(),
    updatedAt: new Date(backend.updated_at).toISOString(),
  };
}

export async function syncWithCloud(): Promise<{
  projects: Project[];
  tasks: Task[];
  docs: Document[];
}> {
  // 1. Load local data from IndexedDB
  const localProjects = await loadProjects();
  const localTasks = await loadTasks();
  const localDocs = await loadDocs();

  // 2. Convert to backend format
  const payload = {
    localProjects: localProjects.map(projectToBackend),
    localTasks: localTasks.map(taskToBackend),
    localDocs: localDocs.map(docToBackend),
  };

  // 3. Call sync endpoint
  const response = await apiSync(payload);

  // 4. Convert backend response back to frontend format
  const mergedProjects = response.projects.map(projectToFrontend);
  const mergedTasks = response.tasks.map(taskToFrontend);
  const mergedDocs = response.docs.map(docToFrontend);

  // 5. Save merged data to IndexedDB (skip sync to avoid loop)
  await saveProjects(mergedProjects, { skipSync: true });
  await saveTasks(mergedTasks, { skipSync: true });
  await saveDocs(mergedDocs, { skipSync: true });

  return { projects: mergedProjects, tasks: mergedTasks, docs: mergedDocs };
}
