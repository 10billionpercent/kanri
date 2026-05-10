import { Edit3, Trash2, Triangle } from "lucide-react";
import type { Task as TaskData } from "../../types";
import { Star } from "lucide-react";
import { TaskStatuses, priorityOrder } from "../../types";
import "./TaskCard.css";

type TaskProps = {
  task: TaskData;
  onEdit?: (task: TaskData) => void;
  onDelete?: (task: TaskData) => void;
  onMoveLeft?: (task: TaskData) => void;
  onMoveRight?: (task: TaskData) => void;
};

function Task({
  task,
  onEdit,
  onDelete,
  onMoveLeft,
  onMoveRight,
}: TaskProps) {
  const canMoveLeft =
    task.status === TaskStatuses.Doing ||
    task.status === TaskStatuses.Done;

  const canMoveRight =
    task.status === TaskStatuses.Todo ||
    task.status === TaskStatuses.Doing;

  const starCount =
  priorityOrder.indexOf(task.priority) + 1;

  const priorityColor =
  task.status === TaskStatuses.Todo
    ? "var(--purple-light)"
    : task.status === TaskStatuses.Doing
      ? "var(--blue-light)"
      : "var(--green-light)";

  return (
    <article className="kanri-task">
      <div className="kanri-task__content">
        <h3 className="kanri-task__title">{task.name}</h3>

        <div
          className="kanri-task__actions"
          aria-label={`${task.name} actions`}
        >
          {Array.from({ length: starCount }).map((_, index) => (
          <Star key={index} size={16} fill="currentColor" style={{ color: priorityColor }}/>
          ))}
          {canMoveLeft && (
            <button
              type="button"
              className="kanri-task__button kanri-task__button--move"
              onClick={() => onMoveLeft?.(task)}
              aria-label={`Move ${task.name} left`}
            >
              <Triangle
                className="kanri-task__triangle--left"
                size={16}
                fill="currentColor"
              />
            </button>
          )}

          <button
            type="button"
            className="kanri-task__button"
            onClick={() => onEdit?.(task)}
            aria-label={`Edit ${task.name}`}
          >
            <Edit3 size={15} />
          </button>

          <button
            type="button"
            className="kanri-task__button"
            onClick={() => onDelete?.(task)}
            aria-label={`Delete ${task.name}`}
          >
            <Trash2 size={15} />
          </button>

          {canMoveRight && (
            <button
              type="button"
              className="kanri-task__button kanri-task__button--move"
              onClick={() => onMoveRight?.(task)}
              aria-label={`Move ${task.name} right`}
            >
              <Triangle
                className="kanri-task__triangle--right"
                size={16}
                fill="currentColor"
              />
            </button>
          )}
        </div>

        {task.description && (
          <p className="kanri-task__description">{task.description}</p>
        )}
      </div>
    </article>
  );
}

export default Task;