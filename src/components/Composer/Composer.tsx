import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FolderPlus, FilePlus, Star } from "lucide-react";
import type { Task } from "../../types";
import { TaskPriorities } from "../../types";
import "./Composer.css";

type BaseComposerProps = {
  initialTask?: Task;
  submitLabel?: string;
  mode: "Task" | "Project";
  onCancel?: () => void;
  color?: string;
};

type TaskComposerProps = BaseComposerProps & {
  showPriority: true;
  onAdd: (
    title: string,
    description: string,
    priority: 1 | 2 | 3
  ) => void;
};

type ProjectComposerProps = BaseComposerProps & {
  showPriority?: false;
  onAdd: (
    title: string,
    description: string
  ) => void;
};

type ComposerProps =
  | TaskComposerProps
  | ProjectComposerProps;

function Composer({
  onAdd,
  initialTask,
  submitLabel = "Add",
  mode,
  onCancel,
  showPriority,
  color
}: ComposerProps) {
  const priorityMap = {
    [TaskPriorities.Low]: 1,
    [TaskPriorities.Medium]: 2,
    [TaskPriorities.High]: 3,
  } as const;

  const [isExpanded, setIsExpanded] = useState(
    initialTask ? true : false
  );

  const [title, setTitle] = useState(
    initialTask?.name ?? ""
  );

  const [description, setDescription] = useState(
    initialTask?.description ?? ""
  );

  const [priority, setPriority] = useState<1 | 2 | 3>(
    initialTask
      ? priorityMap[initialTask.priority]
      : 2
  );

  const titleRef = useRef<HTMLTextAreaElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

function autoResize(
  ref: React.RefObject<HTMLTextAreaElement | null>
) {
  const textarea = ref.current;

  if (!textarea) {
    return;
  }

  textarea.style.height = "0px";
  textarea.style.height = `${textarea.scrollHeight}px`;
}
useEffect(() => {
  autoResize(titleRef);
  autoResize(descriptionRef);
}, [title, description, isExpanded]);

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
    onCancel?.();
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

    onAdd(
      trimmedTitle,
      description.trim(),
      priority
    );

    resetComposer();
  }

  return (
    <div
  className="task-composer"
  style={
    color
      ? ({ "--column-color": color } as CSSProperties)
      : undefined
  }
>
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
            {mode === 'Task'
            ? <FilePlus size={20} />
            : <FolderPlus size={20} />}
            <span>Add {mode} </span>
          </motion.button>
        ) : (
          <motion.div
            key="editor"
            className="task-composer__editor"
            initial={{
              opacity: 0,
              height: 0,
              y: -6,
            }}
            animate={{
              opacity: 1,
              height: "auto",
              y: 0,
            }}
            exit={{
              opacity: 0,
              height: 0,
              y: -6,
            }}
            transition={{
              duration: 0.35,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <p className="task-composer__mode">
  {initialTask ? `Editing ${mode}` : `Adding new ${mode}`}
</p>
            <textarea
  ref={titleRef}
  value={title}
  onChange={(event) =>
    setTitle(event.target.value)
  }
  placeholder={`${mode[0].toUpperCase() + mode.slice(1)} title`}
  rows={1}
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
  ref={descriptionRef}
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
            {showPriority && <div className="task-composer__priority">
              <p className="task-composer__priority-label">
                Priority
              </p>

              <div className="task-composer__stars">
                {[1, 2, 3].map((value) => {
                  const filled =
                    value <= priority;

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
                        setPriority(
                          value as 1 | 2 | 3
                        )
                      }
                      whileHover={{
                        scale: 1.12,
                      }}
                      whileTap={{
                        scale: 0.92,
                      }}
                      aria-label={`Set priority to ${value} star${
                        value > 1 ? "s" : ""
                      }`}
                    >
                      <Star
                        size={20}
                        fill={
                          filled
                            ? "currentColor"
                            : "transparent"
                        }
                      />
                    </motion.button>
                  );
                })}
              </div>
            </div>}

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
                {submitLabel}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Composer;