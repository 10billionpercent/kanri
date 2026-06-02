import { useEffect, useState, useMemo, useCallback } from "react";
import { priorityOrder } from "../../types";
import type { CSSProperties } from "react";
import { ChevronDown } from "lucide-react";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import type { Task } from "../../types";
import TaskCard from "../TaskCard/TaskCard";
import TaskComposer from "../Composer/Composer";
import "./Column.css";
import Pagination from "../Pagination/Pagination";

type ColumnProps = {
  title: "todo" | "doing" | "done";
  color: string;
  tasks: Task[];
  onEdit?: (
    task: Task,
    title: string,
    description: string,
    priority: 1 | 2 | 3,
  ) => void;
  onDelete?: (task: Task) => void;
  onMoveLeft?: (task: Task) => void;
  onMoveRight?: (task: Task) => void;
  onAddTask?: (title: string, description: string, priority: 1 | 2 | 3) => void;
};

function Column({
  title,
  color,
  tasks,
  onEdit,
  onDelete,
  onMoveLeft,
  onMoveRight,
  onAddTask,
}: ColumnProps) {
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const formattedTitle = title.toUpperCase();
  const isTodoColumn = title === "todo";

  const getDefaultExpanded = () => window.innerWidth > 640;
  const [isExpanded, setIsExpanded] = useState(getDefaultExpanded);
  const [taskPage, setTaskPage] = useState(1);

  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      const priorityDiff =
        priorityOrder.indexOf(b.priority) - priorityOrder.indexOf(a.priority);
      if (priorityDiff !== 0) return priorityDiff;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [tasks]);

  const totalTaskPages = Math.max(1, Math.ceil(tasks.length / 5));

  // Clamp page number to valid range
  const safePage = Math.min(taskPage, totalTaskPages);
  const paginatedTasks = useMemo(() => {
    const start = (safePage - 1) * 5;
    return sortedTasks.slice(start, start + 5);
  }, [sortedTasks, safePage]);

  // If safePage changed because total pages decreased, update state (no effect, just in the render)
  // But we avoid setting state during render. Instead, we can let Pagination handle it.
  // However, to keep state in sync, we can optionally update inside a useEffect without lint violation?
  // Actually the better way: when the user clicks pagination, we always set within bounds.
  // We'll just use safePage for display, and when changing page we clamp.

  const handlePageChange = (page: number) => {
    const clamped = Math.min(page, totalTaskPages);
    setTaskPage(clamped);
  };

  useEffect(() => {
    function handleResize() {
      setIsExpanded(getDefaultExpanded());
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleEditTask = useCallback((task: Task) => {
    if (window.innerWidth <= 640) {
      setIsExpanded(true);
    }
    requestAnimationFrame(() => {
      setEditingTaskId(task.id);
    });
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingTaskId(null);
  }, []);

  const handleSaveEdit = useCallback(
    (task: Task, title: string, description: string, priority: 1 | 2 | 3) => {
      onEdit?.(task, title, description, priority);
      setEditingTaskId(null);
    },
    [onEdit],
  );

  const handleAddTask = useCallback(
    (title: string, description: string, priority: 1 | 2 | 3) => {
      onAddTask?.(title, description, priority);
    },
    [onAddTask],
  );

  const editingTask = editingTaskId
    ? tasks.find((t) => t.id === editingTaskId)
    : null;

  return (
    <section
      className={`nagare-column ${isExpanded ? "nagare-column--expanded" : ""}`}
      style={{ "--column-color": color } as CSSProperties}
      aria-label={`${formattedTitle} tasks`}
    >
      <header className="nagare-column__header">
        <h2 className="nagare-column__title">{formattedTitle}</h2>
        {isExpanded && (
          <Pagination
            page={safePage}
            totalPages={totalTaskPages}
            totalItems={tasks.length}
            itemsPerPage={5}
            onChange={handlePageChange}
          />
        )}
        <button
          type="button"
          className="nagare-column__toggle"
          onClick={() => setIsExpanded((prev) => !prev)}
          aria-label={
            isExpanded
              ? `Collapse ${formattedTitle}`
              : `Expand ${formattedTitle}`
          }
          aria-expanded={isExpanded}
        >
          <motion.span
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <ChevronDown size={18} />
          </motion.span>
        </button>
      </header>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            className="nagare-column__body-shell"
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.div
              className="nagare-column__body"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              {/* Add Task Composer – placed at the top */}
              {isTodoColumn && onAddTask && !editingTask && (
                <div className="nagare-column__add-composer">
                  <TaskComposer
                    showPriority
                    mode="Task"
                    onAdd={handleAddTask}
                  />
                </div>
              )}

              {/* Edit Composer – shown when a task is being edited */}
              {editingTask && (
                <div className="nagare-column__edit-composer">
                  <TaskComposer
                    mode="Task"
                    showPriority
                    initialTask={editingTask}
                    submitLabel="Save"
                    onCancel={handleCancelEdit}
                    onAdd={(title, description, priority) =>
                      handleSaveEdit(editingTask, title, description, priority)
                    }
                  />
                </div>
              )}

              {/* Task list */}
              {tasks.length === 0 ? (
                <p className="nagare-column__empty">No tasks here yet.</p>
              ) : (
                <LayoutGroup>
                  <AnimatePresence mode="popLayout">
                    {paginatedTasks.map((task) => (
                      <motion.div
                        key={task.id}
                        layout
                        layoutId={task.id}
                        transition={{
                          layout: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
                        }}
                        style={{ overflow: "hidden" }}
                      >
                        {editingTaskId !== task.id && (
                          <TaskCard
                            task={task}
                            onEdit={() => handleEditTask(task)}
                            onDelete={onDelete}
                            onMoveLeft={onMoveLeft}
                            onMoveRight={onMoveRight}
                          />
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </LayoutGroup>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

export default Column;
