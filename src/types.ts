export interface UserCredentials {
  username: string;
  password: string;
}

export const TaskPriorities = {
  Low: "low",
  Medium: "medium",
  High: "high",
} as const;

export type TaskPriority =
  typeof TaskPriorities[keyof typeof TaskPriorities];

export const TaskStatuses = {
  Todo: "todo",
  Doing: "doing",
  Done: "done",
} as const;

export type TaskStatus =
  typeof TaskStatuses[keyof typeof TaskStatuses];

export interface Project {
  id: string;

  name: string;
  description?: string;

  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;

  projectID: string;

  name: string;
  description?: string;

  priority: TaskPriority;
  status: TaskStatus;

  createdAt: string;
  updatedAt: string;
}

export interface Document {
  id: string;

  projectID: string;

  name: string;
  content: string;

  createdAt: string;
  updatedAt: string;
}

export interface UserData {
  projects: Project[];
  tasks: Task[];
  docs: Document[];
}