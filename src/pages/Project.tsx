import { useState } from "react";
import Column from "../components/Column/Column";
import ProjectHeader from "../components/ProjectHeader/ProjectHeader";
import { TaskPriorities, TaskStatuses } from "../types";
import type { Project, Task } from "../types";

const dummyProject: Project = {
  id: "project-kanri",
  name: "Kanri",
  description: "The main Kanri application project.",
  createdAt: "2026-05-09T08:00:00.000Z",
  updatedAt: "2026-05-09T08:00:00.000Z",
};

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

function Project() {
  const [tasks, setTasks] = useState<Task[]>(dummyTasks);

  function getTasksByStatus(status: Task["status"]) {
    return tasks.filter((task) => task.status === status);
  }

  function handleMoveLeft(taskToMove: Task) {
    setTasks((currentTasks) =>
      currentTasks.map((task) => {
        if (task.id !== taskToMove.id) return task;

        let newStatus = task.status;

        if (task.status === TaskStatuses.Doing) {
          newStatus = TaskStatuses.Todo;
        } else if (task.status === TaskStatuses.Done) {
          newStatus = TaskStatuses.Doing;
        }

        return {
          ...task,
          status: newStatus,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  }

  function handleMoveRight(taskToMove: Task) {
    setTasks((currentTasks) =>
      currentTasks.map((task) => {
        if (task.id !== taskToMove.id) return task;

        let newStatus = task.status;

        if (task.status === TaskStatuses.Todo) {
          newStatus = TaskStatuses.Doing;
        } else if (task.status === TaskStatuses.Doing) {
          newStatus = TaskStatuses.Done;
        }

        return {
          ...task,
          status: newStatus,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  }

  function handleDelete(taskToDelete: Task) {
    setTasks((currentTasks) =>
      currentTasks.filter((task) => task.id !== taskToDelete.id)
    );
  }

  function handleEdit(taskToEdit: Task) {
    const newName = window.prompt("Edit task name", taskToEdit.name);

    if (!newName || !newName.trim()) {
      return;
    }

    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskToEdit.id
          ? {
              ...task,
              name: newName.trim(),
              updatedAt: new Date().toISOString(),
            }
          : task
      )
    );
  }

  return (
    <main className="min-h-svh p-4 sm:p-6">
      <div className="mx-auto w-full max-w-6xl">
        <ProjectHeader
          project={dummyProject}
          tasks={tasks}
          userName="Sankarsana"
          phrase="Keep moving."
        />

        <section className="grid items-start gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <Column
            title="todo"
            color="var(--purple-light)"
            tasks={getTasksByStatus(TaskStatuses.Todo)}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onMoveLeft={handleMoveLeft}
            onMoveRight={handleMoveRight}
          />

          <Column
            title="doing"
            color="var(--blue-light)"
            tasks={getTasksByStatus(TaskStatuses.Doing)}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onMoveLeft={handleMoveLeft}
            onMoveRight={handleMoveRight}
          />

          <Column
            title="done"
            color="var(--green-light)"
            tasks={getTasksByStatus(TaskStatuses.Done)}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onMoveLeft={handleMoveLeft}
            onMoveRight={handleMoveRight}
          />
        </section>
      </div>
    </main>
  );
}

export default Project;