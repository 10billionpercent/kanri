import { useState } from "react";
import type { CSSProperties } from "react";
import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import type { Task } from "../../types";
import TaskCard from "../TaskCard/TaskCard";
import TaskComposer from "../TaskComposer/TaskComposer";
import "./Column.css";

type ColumnProps = {
  title: "todo" | "doing" | "done";
  color: string;
  tasks: Task[];
  onEdit?: (task: Task) => void;
  onDelete?: (task: Task) => void;
  onMoveLeft?: (task: Task) => void;
  onMoveRight?: (task: Task) => void;
  onAddTask?: (title: string, description: string) => void;
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
  const [isExpanded, setIsExpanded] = useState(true);
  const formattedTitle = title.toUpperCase();
  const isTodoColumn = title === "todo";

  return (
    <section
      className={`kanri-column ${isExpanded ? "kanri-column--expanded" : ""}`}
      style={{ "--column-color": color } as CSSProperties}
      aria-label={`${formattedTitle} tasks`}
    >
      <header className="kanri-column__header">
        <h2 className="kanri-column__title">{formattedTitle}</h2>

        <button
          type="button"
          className="kanri-column__toggle"
          onClick={() => setIsExpanded((current) => !current)}
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
            className="kanri-column__body-shell"
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.div
              className="kanri-column__body"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              {/* Show TaskComposer only in TODO column */}
              {isTodoColumn && onAddTask && (
                <TaskComposer onAdd={onAddTask} />
              )}

              {tasks.length === 0 ? (
                <p className="kanri-column__empty">No tasks here yet.</p>
              ) : (
                <AnimatePresence mode="popLayout">
                  {tasks.map((task) => (
                    <motion.div
                      key={task.id}
                      layout
                      initial={{
                        opacity: 0,
                        y: -6,
                        height: 0,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        height: "auto",
                      }}
                      exit={{
                        opacity: 0,
                        y: -6,
                        height: 0,
                      }}
                      transition={{
                        duration: 0.6,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      style={{ overflow: "hidden" }}
                    >
                      <TaskCard
                        task={task}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onMoveLeft={onMoveLeft}
                        onMoveRight={onMoveRight}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

export default Column;