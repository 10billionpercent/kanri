import { useState } from "react";
import type { CSSProperties } from "react";
import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import type { Task } from "../../types";
import TaskCard from "../Task/Task";
import "./Column.css";

type ColumnProps = {
  title: "todo" | "doing" | "done";
  color: string;
  tasks: Task[];
};

function Column({ title, color, tasks }: ColumnProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const formattedTitle = title.toUpperCase();

  return (
    <section
      className={`kanri-column ${isExpanded ? "kanri-column--expanded" : ""}`}
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
              {tasks.length === 0 ? (
                <p className="kanri-column__empty">No tasks here yet.</p>
              ) : (
                tasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={(selectedTask) => console.log("Edit task:", selectedTask)}
                    onDelete={(selectedTask) => console.log("Delete task:", selectedTask)}
                    onMoveLeft={(selectedTask) => console.log("Move task left:", selectedTask)}
                    onMoveRight={(selectedTask) => console.log("Move task right:", selectedTask)}
                  />
                ))
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

export default Column;
