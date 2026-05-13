import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FolderOpen } from "lucide-react";
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
  projectProgressMap: Record<string, string>;
};

function ProjectHeader({
  project,
  tasks,
  phrase,
  projects,
  projectProgressMap
}: ProjectHeaderProps) {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.user);
  const userName = user?.name || user?.username || "there";
  const currentProject = useSelector((state: RootState) => state.projects.currentProjectId);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const projectPanelRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
  if (!isProjectModalOpen) {
    return;
  }

  function handleClickOutside(event: MouseEvent) {
    if (
      projectPanelRef.current &&
      !projectPanelRef.current.contains(
        event.target as Node
      )
    ) {
      setIsProjectModalOpen(false);
    }
  }

  document.addEventListener(
    "mousedown",
    handleClickOutside
  );

  return () => {
    document.removeEventListener(
      "mousedown",
      handleClickOutside
    );
  };
}, [isProjectModalOpen]);

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

  function formatUpdatedAt(dateString: string) {
  const date = new Date(dateString);

  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
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
    mode="Project"
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
<div ref={projectPanelRef} className="relative project-panel-wrapper">
  <button
    type="button"
    className="project-panel__trigger"
    onClick={() =>
      setIsProjectModalOpen((prev) => !prev)
    }
  >
    <FolderOpen size={20} />
    All Projects
  </button>

  <AnimatePresence>
  {isProjectModalOpen && (
    <motion.div
      className="project-panel"
      initial={{
        opacity: 0,
        y: -8,
        transformOrigin: "top right",
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      exit={{
        opacity: 0,
        y: -8,
      }}
      transition={{
        duration: 0.4,
        ease: "easeOut",
      }}
    >
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
          <span className="project-panel__name">
            {p.name}
          </span>

          <span className="project-panel__progress">
            {projectProgressMap[p.id]}
          </span>

          <span className="project-panel__date">
            Updated {formatUpdatedAt(p.updatedAt)}
          </span>
        </button>
      ))}
    </motion.div>
  )}
</AnimatePresence>
</div>
</div>
    </header>
  );
}

export default ProjectHeader;