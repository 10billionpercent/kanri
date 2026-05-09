import Column from "../components/Column/Column";
import { TaskPriorities, TaskStatuses } from "../types";
import type { Task } from "../types";

const dummyTasks: Task[] = [
  {
    id: "task-1",
    projectID: "project-kanri",
    name: "Shape the signup flow",
    description: "Local-first entry with optional sync.",
    priority: TaskPriorities.High,
    status: TaskStatuses.Todo,
    createdAt: "2026-05-09T09:00:00.000Z",
    updatedAt: "2026-05-09T09:00:00.000Z",
  },
  {
    id: "task-2",
    projectID: "project-kanri",
    name: "Test column collapse behavior",
    priority: TaskPriorities.Medium,
    status: TaskStatuses.Todo,
    createdAt: "2026-05-09T09:10:00.000Z",
    updatedAt: "2026-05-09T09:10:00.000Z",
  },
  {
    id: "task-3",
    projectID: "project-kanri",
    name: "Create reusable Column component",
    description: "Header, task count, color prop, and expand/collapse.",
    priority: TaskPriorities.High,
    status: TaskStatuses.Doing,
    createdAt: "2026-05-09T09:20:00.000Z",
    updatedAt: "2026-05-09T09:20:00.000Z",
  },
  {
    id: "task-4",
    projectID: "project-kanri",
    name: "Add React Router",
    priority: TaskPriorities.Low,
    status: TaskStatuses.Done,
    createdAt: "2026-05-09T09:30:00.000Z",
    updatedAt: "2026-05-09T09:30:00.000Z",
  },
];

function getTasksByStatus(status: Task["status"]) {
  return dummyTasks.filter((task) => task.status === status);
}

function Project() {
  return (
    <main className="min-h-svh p-4 sm:p-6">
      <section className="mx-auto grid w-full max-w-6xl items-start gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Column
          title="todo"
          color="var(--purple-light)"
          tasks={getTasksByStatus(TaskStatuses.Todo)}
        />
        <Column
          title="doing"
          color="var(--blue-light)"
          tasks={getTasksByStatus(TaskStatuses.Doing)}
        />
        <Column
          title="done"
          color="var(--green-light)"
          tasks={getTasksByStatus(TaskStatuses.Done)}
        />
      </section>
    </main>
  );
}

export default Project;
