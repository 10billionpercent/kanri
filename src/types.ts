export interface UserCredentials {
    username: string;
    password: string;
}

export const TaskPriorities = {
  Low: 1,
  Medium: 2,
  High: 3,
} as const;

export type TaskPriority = typeof TaskPriorities[keyof typeof TaskPriorities];

export interface Task {
    name: string;
    description?: string;
    priority: TaskPriority;
    projectID: string;    
}

export interface Document {
    name: string;
    content: string;
}

export interface Project {
    name: string;
    description?: string;
    tasks: Task[];
    docs: Document[];  
    user: string;  
}

export interface UserData {
    projects: Project[];
}