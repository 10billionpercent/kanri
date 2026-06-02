import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type { Task, TaskPriority, TaskStatus } from "../types";
import {
  fetchTasks,
  createTask,
  updateTask as updateTaskApi,
  deleteTask as deleteTaskApi,
  type BackendTask,
} from "../services/api";

function fromBackend(t: BackendTask): Task {
  return {
    id: t.id,
    projectID: t.project_id,
    name: t.name,
    description: t.description ?? undefined,
    priority: t.priority as TaskPriority,
    status: t.status as TaskStatus,
    createdAt: new Date(t.created_at).toISOString(),
    updatedAt: new Date(t.updated_at).toISOString(),
  };
}

export const loadTasks = createAsyncThunk("tasks/load", async () => {
  const data = await fetchTasks(); 
  return data.map(fromBackend);
});

export const addTaskThunk = createAsyncThunk(
  "tasks/add",
  async (
    task: Omit<Task, "id" | "createdAt" | "updatedAt"> & { id?: string },
  ) => {
    const now = Date.now();
    const newTask = {
      id: task.id,
      project_id: task.projectID,
      name: task.name,
      description: task.description,
      priority: task.priority,
      status: task.status,
      created_at: now,
      updated_at: now,
    };
    await createTask(newTask);
    return fromBackend(newTask as BackendTask);
  },
);

export const updateTaskThunk = createAsyncThunk(
  "tasks/update",
  async (task: Task) => {
    await updateTaskApi(task.id, {
      name: task.name,
      description: task.description,
      priority: task.priority,
      status: task.status,
      updated_at: new Date(task.updatedAt).getTime(),
    });
    return task;
  },
);

export const deleteTaskThunk = createAsyncThunk(
  "tasks/delete",
  async (id: string) => {
    await deleteTaskApi(id);
    return id;
  },
);

const initialState: Task[] = [];

const taskSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    setTasks(_state, action: PayloadAction<Task[]>) {
      return action.payload;
    },
    addTask(state, action: PayloadAction<Task>) {
      state.push(action.payload);
    },
    updateTask(state, action: PayloadAction<Task>) {
      const index = state.findIndex((t) => t.id === action.payload.id);
      if (index !== -1) state[index] = action.payload;
    },
    deleteTask(state, action: PayloadAction<string>) {
      return state.filter((t) => t.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadTasks.fulfilled, (_, action) => action.payload)
      .addCase(addTaskThunk.fulfilled, (state, action) => {
        state.push(action.payload);
      })
      .addCase(updateTaskThunk.fulfilled, (state, action) => {
        const index = state.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) state[index] = action.payload;
      })
      .addCase(deleteTaskThunk.fulfilled, (state, action) => {
        return state.filter((t) => t.id !== action.payload);
      });
  },
});

export const { setTasks, addTask, updateTask, deleteTask } = taskSlice.actions;
export default taskSlice.reducer;
