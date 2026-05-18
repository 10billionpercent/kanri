import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FolderOpen, Edit3, Trash2 } from "lucide-react";
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
  const allProjects = useSelector(
  (state: RootState) => state.projects.allProjects
);
  const userName = user?.name || user?.username || "there";
  const currentProject = useSelector((state: RootState) => state.projects.currentProjectId);
const [editingProject, setEditingProject] =
  useState<Project | null>(null);
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

    async function handleAddProject(
  title: string,
  description: string
) {
  const newProject: Project = {
    id: crypto.randomUUID(),
    name: title,
    description: description || undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const updatedProjects = [
    newProject,
    ...allProjects,
  ];

  dispatch(addProject(newProject));
  await saveProjects(updatedProjects);
}

  async function handleUpdateProject(
  title: string,
  description: string
) {
  if (!editingProject) {
    return;
  }

  const updatedProject: Project = {
    ...editingProject,
    name: title,
    description:
      description.trim() || undefined,
    updatedAt: new Date().toISOString(),
  };

  const updatedProjects = allProjects.map(
    (project) =>
      project.id === updatedProject.id
        ? updatedProject
        : project
  );

  dispatch(updateProject(updatedProject));
  await saveProjects(updatedProjects);
}

async function handleDeleteProject(
  projectToDelete: Project
) {
  const updatedProjects = allProjects.filter(
    (project) =>
      project.id !== projectToDelete.id
  );

  dispatch(deleteProject(projectToDelete.id));
  await saveProjects(updatedProjects);

  if (editingProject?.id === projectToDelete.id) {
    setEditingProject(null);
  }
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

      <p className="project-header__phrase">{phrase}       <button
  type="button"
  className="project-header__logout"
  onClick={handleLogout}
>
  Log out
</button></p>

      <p className="project-header__stat">{getStatText()}</p>
<div className="mt-1 flex flex-wrap items-end gap-5">
<AnimatePresence initial={false} mode="wait">
  {editingProject ? (
    <motion.div
      key={`editor-${editingProject.id}`}
      layout="position"
      initial={false}
      animate={{ opacity: 1 }}
      exit={{ opacity: 1 }}
      transition={{
        duration: 0,
      }}
    >
      <Composer
        mode="Project"
        initialProject={editingProject}
        submitLabel="Save"
        onCancel={() =>
          setEditingProject(null)
        }
        onAdd={(
          title,
          description
        ) => {
          handleUpdateProject(
            title,
            description
          );
          setEditingProject(null);
        }}
        color="var(--blue-light)"
      />
    </motion.div>
  ) : (
    <motion.div
      key="add-project"
      layout="position"
      initial={false}
      animate={{ opacity: 1 }}
      exit={{ opacity: 1 }}
      transition={{
        duration: 0,
      }}
    >
      <Composer
        mode="Project"
        onAdd={handleAddProject}
        color="var(--blue-light)"
      />
    </motion.div>
  )}
</AnimatePresence>

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
        <div key={p.id} className="flex gap-1">
        <button
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
        <div className="flex-col gap-2">
          <button  className='project-panel__settings-action'
          onClick={() => {
  setEditingProject(p);
}}>
            <Edit3 size={16} />
          </button>
                    <button className='project-panel__settings-action'
                    onClick={() => {
handleDeleteProject(p)
}
}>
            <Trash2 size={16} />
          </button>
        </div>
        </div>
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