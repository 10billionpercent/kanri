import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { RootState, AppDispatch } from "../../store";
import { clearUser } from "../../reducers/userReducer";
import "./ProjectHeader.css";
import type { Project, Task } from "../../types";
import { TaskStatuses } from "../../types";
import { clearUser as clearStoredUser, loadProjects, saveProjects } from "../../db";
import Composer  from "../Composer/Composer";
import { setProjects, addProject, updateProject, deleteProject, setCurrentProject} from "../../reducers/projectReducer";

type ProjectHeaderProps = {
  project: Project;
  tasks: Task[];
  phrase: string;
  projects: Project[];
};

function ProjectHeader({
  project,
  tasks,
  phrase,
  projects
}: ProjectHeaderProps) {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.user);
  const userName = user?.name || user?.username || "there";
  const currentProject = useSelector((state: RootState) => state.projects.currentProjectId);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  const sortedProjects = useMemo(() => {
  return [...projects].sort(
    (a, b) =>
      new Date(b.updatedAt).getTime() -
      new Date(a.updatedAt).getTime()
  );
}, [projects]);

const visibleProjects = sortedProjects.slice(0, 3);

    useEffect(() => {
    async function initializeProjects() {
      const savedTasks = await loadProjects();
      dispatch(setProjects(savedTasks));
    }
  
    initializeProjects();
  }, [dispatch]);


  const todoCount = tasks.filter(
    (task) => task.status === TaskStatuses.Todo
  ).length;

  const doingCount = tasks.filter(
    (task) => task.status === TaskStatuses.Doing
  ).length;

  const doneCount = tasks.filter(
    (task) => task.status === TaskStatuses.Done
  ).length;

  const totalCount = tasks.length;

  async function handleLogout() {
  try {
    await clearStoredUser(); 
  } catch (error) {
    console.error("Failed to clear stored user:", error);
  }

  dispatch(clearUser()); 
  navigate("/signup");
}

  function getStatText() {
    if (totalCount > 0 && doneCount === totalCount) {
      return `${project.name} • ${doneCount} done`;
    }

    if (doingCount > 0) {
      return `${project.name} • ${doingCount} in progress`;
    }

    if (todoCount > 0) {
      return `${project.name} • ${todoCount} to do`;
    }

    return `${project.name} • 0 total`;
  }

    async function handleAddProject(title: string, description: string) {
    const newProject: Project = {
      id: crypto.randomUUID(),
      name: title,
      description: description || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  
    dispatch(addProject(newProject));
  
    await saveProjects([newProject, ...projects]);
  }

  return (
    <header className="project-header">
      <h1 className="project-header__greeting">
        Good evening,{" "}
        <motion.span
          className="project-header__name"
          initial={{
            opacity: 0,
            y: 6,
            filter: "blur(4px)",
          }}
          animate={{
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
          }}
          transition={{
            duration: 0.7,
            delay: 0.15,
            ease: "easeOut",
          }}
        >
          {userName}.
        </motion.span>
      </h1>

      <p className="project-header__phrase">{phrase}</p>

      <p className="project-header__stat">{getStatText()}</p>
      <button
  type="button"
  className="project-header__logout"
  onClick={handleLogout}
>
  Log out
</button>
<div className="mt-1 flex flex-wrap items-end gap-5">
  <Composer
    mode="project"
    onAdd={handleAddProject}
    color="var(--blue-light)"
  />

  {visibleProjects.map((p) => (
    <button
      key={p.id}
      type="button"
      className={`project-header__project ${
        p.id === currentProject
          ? "project-header__project--selected"
          : ""
      }`}
      onClick={() => dispatch(setCurrentProject(p.id))}
    >
      {p.name}
    </button>
  ))}
  <div className="relative">
  <button
    type="button"
    className="project-header__project"
    onClick={() =>
      setIsProjectModalOpen((prev) => !prev)
    }
  >
    All Projects
  </button>

  {isProjectModalOpen && (
    <div className="project-panel">
      {sortedProjects.map((p) => (
        <button
          key={p.id}
          type="button"
          className={`project-panel__item ${
            p.id === currentProject
              ? "project-panel__item--selected"
              : ""
          }`}
          onClick={() => {
            dispatch(setCurrentProject(p.id));
            setIsProjectModalOpen(false);
          }}
        >
          {p.name}
        </button>
      ))}
    </div>
  )}
</div>
</div>
    </header>
  );
}

export default ProjectHeader;