import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Column from "../components/Column/Column";
import ProjectHeader from "../components/ProjectHeader/ProjectHeader";
import { TaskPriorities, TaskStatuses } from "../types";
import type { Project, Task } from "../types";
import { loadTasks, saveTasks } from "../db";
import type { RootState, AppDispatch } from "../store";
import { addTask, deleteTask, setTasks, updateTask } from "../reducers/taskReducer";

const dummyProject: Project = {
  id: "project-kanri",
  name: "dummy project",
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

function ProjectPage() {
  const userTasks = useSelector((state: RootState) => state.tasks);
const userProjects = useSelector(
  (state: RootState) => state.projects.allProjects
);
const currentProjectId = useSelector(
  (state: RootState) => state.projects.currentProjectId
);
const dispatch = useDispatch<AppDispatch>();

// Always include the built-in demo project
const allProjects = [dummyProject, ...userProjects];

// Find currently selected project
const currentProject =
  allProjects.find(
    (project) => project.id === currentProjectId
  ) ?? dummyProject;

// Show dummy tasks if dummy project is selected,
// otherwise show only tasks belonging to the selected project
const visibleTasks =
  currentProject.id === dummyProject.id
    ? dummyTasks
    : userTasks.filter(
        (task) =>
          task.projectID === currentProject.id
      );

  useEffect(() => {
  async function initializeTasks() {
    const savedTasks = await loadTasks();

    if (savedTasks.length > 0) {
      dispatch(setTasks(savedTasks));
    } else {
      dispatch(setTasks(dummyTasks));
      await saveTasks(dummyTasks);
    }
  }

  initializeTasks();
}, [dispatch]);

  function getTasksByStatus(status: Task["status"]) {
    return visibleTasks.filter((task) => task.status === status);
  }

  function handleMoveLeft(taskToMove: Task) {
  let newStatus = taskToMove.status;

  if (taskToMove.status === TaskStatuses.Doing) {
    newStatus = TaskStatuses.Todo;
  } else if (taskToMove.status === TaskStatuses.Done) {
    newStatus = TaskStatuses.Doing;
  }

  const updatedTask: Task = {
    ...taskToMove,
    status: newStatus,
    updatedAt: new Date().toISOString(),
  };

  dispatch(updateTask(updatedTask));

  const updatedTasks = visibleTasks.map((task) =>
    task.id === updatedTask.id ? updatedTask : task
  );

  saveTasks(updatedTasks);
}

function handleMoveRight(taskToMove: Task) {
  let newStatus = taskToMove.status;

  if (taskToMove.status === TaskStatuses.Todo) {
    newStatus = TaskStatuses.Doing;
  } else if (taskToMove.status === TaskStatuses.Doing) {
    newStatus = TaskStatuses.Done;
  }

  const updatedTask: Task = {
    ...taskToMove,
    status: newStatus,
    updatedAt: new Date().toISOString(),
  };

  dispatch(updateTask(updatedTask));

  const updatedTasks = visibleTasks.map((task) =>
    task.id === updatedTask.id ? updatedTask : task
  );

  saveTasks(updatedTasks);
}

  function handleDelete(taskToDelete: Task) {
    dispatch(deleteTask(taskToDelete.id));
  }

async function handleEdit(
  taskToEdit: Task,
  title: string,
  description: string,
  priority: 1 | 2 | 3
) {
  const priorityMap = {
    1: TaskPriorities.Low,
    2: TaskPriorities.Medium,
    3: TaskPriorities.High,
  } as const;

  const updatedTask: Task = {
    ...taskToEdit,
    name: title,
    description: description || undefined,
    priority: priorityMap[priority],
    updatedAt: new Date().toISOString(),
  };

  dispatch(updateTask(updatedTask));

  const updatedTasks = visibleTasks.map((task) =>
    task.id === updatedTask.id
      ? updatedTask
      : task
  );

  await saveTasks(updatedTasks);
}

  async function handleAddTask(title: string, description: string, priority: 1 | 2 | 3) {
    const priorityMap = {
    1: TaskPriorities.Low,
    2: TaskPriorities.Medium,
    3: TaskPriorities.High,
  } as const;
   if (currentProject.id === dummyProject.id) {
    return;
  }
  const newTask: Task = {
    id: crypto.randomUUID(),
    projectID: currentProjectId,
    name: title,
    description: description || undefined,
    priority: priorityMap[priority],
    status: TaskStatuses.Todo,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  dispatch(addTask(newTask));

  await saveTasks([newTask, ...visibleTasks]);
}

  return (
    <main className="min-h-svh p-4 sm:p-6">
      <div className="mx-auto w-full max-w-6xl">
        <ProjectHeader
          project={currentProject}
          tasks={visibleTasks}
          phrase="Keep moving."
          projects={allProjects}
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
            onAddTask={handleAddTask}
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

export default ProjectPage;