import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Column from "../components/Column/Column";
import ProjectHeader from "../components/ProjectHeader/ProjectHeader";
import { TaskPriorities, TaskStatuses } from "../types";
import type { Task } from "../types";
import type { RootState, AppDispatch } from "../store";
import {
  loadTasks,
  addTaskThunk,
  updateTaskThunk,
  deleteTaskThunk,
} from "../reducers/taskReducer";
import { loadProjects, updateProjectThunk } from "../reducers/projectReducer";

function ProjectPage() {
  const dispatch = useDispatch<AppDispatch>();

  const tasks = useSelector((state: RootState) => state.tasks);
  const projects = useSelector(
    (state: RootState) => state.projects.allProjects,
  );
  const currentProjectId = useSelector(
    (state: RootState) => state.projects.currentProjectId,
  );
  const user = useSelector((state: RootState) => state.user);

  // Load data from backend if logged in
  useEffect(() => {
    if (user?.authMode === "account") {
      dispatch(loadProjects());
      dispatch(loadTasks()); // now takes no arguments
    }
  }, [user, dispatch]);

  // Find current project
  const currentProject =
    projects.find((p) => p.id === currentProjectId) ?? projects[0] ?? null;

  // Filter tasks for current project
  const visibleTasks = currentProject
    ? tasks.filter((task) => task.projectID === currentProject.id)
    : [];

  // Compute progress for header
  const projectProgressMap: Record<string, string> = {};
  for (const project of projects) {
    const projectTasks = tasks.filter((t) => t.projectID === project.id);
    const doingCount = projectTasks.filter(
      (t) => t.status === TaskStatuses.Doing,
    ).length;
    projectProgressMap[project.id] =
      `${doingCount}/${projectTasks.length} in progress`;
  }

  function getTasksByStatus(status: Task["status"]) {
    return visibleTasks.filter((task) => task.status === status);
  }

  // Update current project's updatedAt timestamp
  async function touchCurrentProject() {
    if (!currentProject) return;
    const updatedProject = {
      ...currentProject,
      updatedAt: new Date().toISOString(),
    };
    await dispatch(updateProjectThunk(updatedProject)).unwrap();
  }

  async function handleMoveLeft(taskToMove: Task) {
    let newStatus = taskToMove.status;
    if (taskToMove.status === TaskStatuses.Doing) {
      newStatus = TaskStatuses.Todo;
    } else if (taskToMove.status === TaskStatuses.Done) {
      newStatus = TaskStatuses.Doing;
    }
    const updatedTask = {
      ...taskToMove,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    };
    await dispatch(updateTaskThunk(updatedTask)).unwrap();
    await touchCurrentProject();
  }

  async function handleMoveRight(taskToMove: Task) {
    let newStatus = taskToMove.status;
    if (taskToMove.status === TaskStatuses.Todo) {
      newStatus = TaskStatuses.Doing;
    } else if (taskToMove.status === TaskStatuses.Doing) {
      newStatus = TaskStatuses.Done;
    }
    const updatedTask = {
      ...taskToMove,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    };
    await dispatch(updateTaskThunk(updatedTask)).unwrap();
    await touchCurrentProject();
  }

  async function handleDelete(taskToDelete: Task) {
    await dispatch(deleteTaskThunk(taskToDelete.id)).unwrap();
    await touchCurrentProject();
  }

  async function handleEdit(
    taskToEdit: Task,
    title: string,
    description: string,
    priority: 1 | 2 | 3,
  ) {
    const priorityMap = {
      1: TaskPriorities.Low,
      2: TaskPriorities.Medium,
      3: TaskPriorities.High,
    };
    const updatedTask = {
      ...taskToEdit,
      name: title,
      description: description || undefined,
      priority: priorityMap[priority as 1 | 2 | 3],
      updatedAt: new Date().toISOString(),
    };
    await dispatch(updateTaskThunk(updatedTask)).unwrap();
    await touchCurrentProject();
  }

  async function handleAddTask(
    title: string,
    description: string,
    priority: 1 | 2 | 3,
  ) {
    if (!currentProject) return;
    const priorityMap = {
      1: TaskPriorities.Low,
      2: TaskPriorities.Medium,
      3: TaskPriorities.High,
    };
    const newTask = {
      projectID: currentProject.id,
      name: title,
      description: description || undefined,
      priority: priorityMap[priority as 1 | 2 | 3],
      status: TaskStatuses.Todo,
    };
    await dispatch(addTaskThunk(newTask)).unwrap();
    await touchCurrentProject();
  }

  if (!currentProject && user?.authMode === "account") {
    return <div className="p-8 text-center">Loading projects...</div>;
  }

  if (!currentProject) {
    return (
      <div className="p-8 text-center">No project selected. Create one?</div>
    );
  }

  return (
    <main className="min-h-svh p-4 sm:p-6">
      <div className="mx-auto w-full max-w-6xl">
        <ProjectHeader
          project={currentProject}
          tasks={visibleTasks}
          phrase="Keep moving."
          projectProgressMap={projectProgressMap}
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
