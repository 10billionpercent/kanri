import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { ChevronDown } from "lucide-react";
import {
  AnimatePresence,
  LayoutGroup,
  motion,
} from "framer-motion";
import type { Task } from "../../types";
import TaskCard from "../TaskCard/TaskCard";
import TaskComposer from "../Composer/Composer";
import "./Column.css";

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
  onAddTask?: (
    title: string,
    description: string,
    priority: 1 | 2 | 3,
  ) => void;
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
  const [editingTask, setEditingTask] =
    useState<Task | null>(null);

  const formattedTitle = title.toUpperCase();
  const isTodoColumn = title === "todo";
  const [isExpanded, setIsExpanded] = useState(
  () => window.innerWidth > 640
);

useEffect(() => {
  function handleResize() {
    setIsExpanded(window.innerWidth > 640);
  }

  window.addEventListener("resize", handleResize);

  return () => {
    window.removeEventListener(
      "resize",
      handleResize
    );
  };
}, []);

  return (
    <section
      className={`kanri-column ${
        isExpanded ? "kanri-column--expanded" : ""
      }`}
      style={{ "--column-color": color } as CSSProperties}
      aria-label={`${formattedTitle} tasks`}
    >
      <header className="kanri-column__header">
        <h2 className="kanri-column__title">
          {formattedTitle}
        </h2>

        <button
          type="button"
          className="kanri-column__toggle"
          onClick={() =>
            setIsExpanded((current) => !current)
          }
          aria-label={
            isExpanded
              ? `Collapse ${formattedTitle}`
              : `Expand ${formattedTitle}`
          }
          aria-expanded={isExpanded}
        >
          <motion.span
            animate={{
              rotate: isExpanded ? 180 : 0,
            }}
            transition={{
              duration: 0.4,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <ChevronDown size={18} />
          </motion.span>
        </button>
      </header>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            className="kanri-column__body-shell"
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{
              duration: 0.4,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <motion.div
              className="kanri-column__body"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{
                duration: 0.4,
                ease: "easeOut",
              }}
            >
              {isTodoColumn &&
                onAddTask &&
                !editingTask && (
                  <TaskComposer  showPriority mode='Task' onAdd={onAddTask} />
                )}

              {tasks.length === 0 ? (
                <p className="kanri-column__empty">
                  No tasks here yet.
                </p>
              ) : (
                <LayoutGroup>
                  <AnimatePresence mode="popLayout">
                    {tasks.map((task) => (
                      <motion.div
                        key={task.id}
                        layout
                        layoutId={task.id}
                        transition={{
                          layout: {
                            duration: 0.6,
                            ease: [
                              0.16,
                              1,
                              0.3,
                              1,
                            ],
                          },
                        }}
                        style={{ overflow: "hidden" }}
                      >
                        {/* Keep edit-mode swap instant */}
                        <AnimatePresence
                          initial={false}
                          mode="wait"
                        >
                          {editingTask?.id === task.id ? (
                            <motion.div
                              key={`editor-${task.id}`}
                              layout="position"
                              initial={false}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 1 }}
                              transition={{
                                duration: 0,
                              }}
                            >
                              <TaskComposer
                                mode='Task'
                                showPriority
                                initialTask={task}
                                submitLabel="Save"
                                onCancel={() =>
                                  setEditingTask(null)
                                }
                                onAdd={(
                                  title,
                                  description,
                                  priority,
                                ) => {
                                  onEdit?.(
                                    task,
                                    title,
                                    description,
                                    priority,
                                  );
                                  setEditingTask(null);
                                }}
                              />
                            </motion.div>
                          ) : (
                            <motion.div
                              key={`card-${task.id}`}
                              layout="position"
                              initial={false}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 1 }}
                              transition={{
                                duration: 0,
                              }}
                            >
                              <TaskCard
                                task={task}
                                onEdit={() =>
                                  setEditingTask(task)
                                }
                                onDelete={onDelete}
                                onMoveLeft={
                                  onMoveLeft
                                }
                                onMoveRight={
                                  onMoveRight
                                }
                              />
                            </motion.div>
                          )}
                        </AnimatePresence>
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