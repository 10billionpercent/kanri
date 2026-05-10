import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Star } from "lucide-react";
import "./TaskComposer.css";

type TaskComposerProps = {
  onAdd: (
    title: string,
    description: string,
    priority: 1 | 2 | 3
  ) => void;
};

function TaskComposer({ onAdd }: TaskComposerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<1 | 2 | 3>(2); 

  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isExpanded) {
      titleRef.current?.focus();
    }
  }, [isExpanded]);

  function resetComposer() {
    setTitle("");
    setDescription("");
    setPriority(2);
    setIsExpanded(false);
  }

  function handleCancel() {
    resetComposer();
  }

  function handleAdd() {
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      titleRef.current?.focus();
      return;
    }

    onAdd(trimmedTitle, description.trim(), priority);
    resetComposer();
  }

  return (
    <div className="task-composer">
      <AnimatePresence mode="wait">
        {!isExpanded ? (
          <motion.button
            key="button"
            type="button"
            className="task-composer__trigger"
            onClick={() => setIsExpanded(true)}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
          >
            <Plus size={16} />
            <span>Add task</span>
          </motion.button>
        ) : (
          <motion.div
            key="editor"
            className="task-composer__editor"
            initial={{ opacity: 0, height: 0, y: -6 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -6 }}
            transition={{
              duration: 0.35,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <input
              ref={titleRef}
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Task title"
              className="task-composer__input"
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  handleCancel();
                }

                if (
                  event.key === "Enter" &&
                  (event.metaKey || event.ctrlKey)
                ) {
                  handleAdd();
                }
              }}
            />

            <textarea
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              placeholder="Description (optional)"
              rows={4}
              className="task-composer__textarea"
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  handleCancel();
                }

                if (
                  event.key === "Enter" &&
                  (event.metaKey || event.ctrlKey)
                ) {
                  handleAdd();
                }
              }}
            />
            <div className="task-composer__priority">
              <p className="task-composer__priority-label">
                Priority
              </p>

              <div className="task-composer__stars">
                {[1, 2, 3].map((value) => {
                  const filled = value <= priority;

                  return (
                    <motion.button
                      key={value}
                      type="button"
                      className={`task-composer__star ${
                        filled
                          ? "task-composer__star--filled"
                          : ""
                      }`}
                      onClick={() =>
                        setPriority(value as 1 | 2 | 3)
                      }
                      whileHover={{ scale: 1.12 }}
                      whileTap={{ scale: 0.92 }}
                      aria-label={`Set priority to ${value} star${
                        value > 1 ? "s" : ""
                      }`}
                    >
                      <Star
                        size={20}
                        fill={
                          filled
                            ? "var(--purple-light)"
                            : "transparent"
                        }
                      />
                    </motion.button>
                  );
                })}
              </div>
            </div>

            <div className="task-composer__actions">
              <button
                type="button"
                className="task-composer__cancel"
                onClick={handleCancel}
              >
                Cancel
              </button>

              <button
                type="button"
                className="task-composer__add"
                onClick={handleAdd}
              >
                Add
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default TaskComposer;