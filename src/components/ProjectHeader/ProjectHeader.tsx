import "./ProjectHeader.css";
import type { Project, Task } from "../../types";
import { TaskStatuses } from "../../types";

type ProjectHeaderProps = {
  project: Project;
  tasks: Task[];
  userName: string;
  phrase: string;
};

function ProjectHeader({
  project,
  tasks,
  userName,
  phrase,
}: ProjectHeaderProps) {
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

  const getStatText = () => {
    // If all tasks are completed
    if (totalCount > 0 && doneCount === totalCount) {
      return `${project.name} • ${doneCount} done`;
    }

    // If there are tasks currently being worked on
    if (doingCount > 0) {
      return `${project.name} • ${doingCount} in progress`;
    }

    // If there are pending tasks
    if (todoCount > 0) {
      return `${project.name} • ${todoCount} to do`;
    }

    // Empty project
    return `${project.name} • 0 total`;
  };

  return (
    <header className="project-header">
      <h1 className="project-header__greeting">
        Good evening, {userName}.
      </h1>

      <p className="project-header__phrase">
        {phrase}
      </p>

      <p className="project-header__stat">
        {getStatText()}
      </p>
    </header>
  );
}

export default ProjectHeader;