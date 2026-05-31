import { createAsyncThunk } from "@reduxjs/toolkit";
import { syncWithCloud } from "./services/sync";
import { setProjects } from "./reducers/projectReducer";
import { setTasks } from "./reducers/taskReducer";

export const syncAfterLogin = createAsyncThunk(
  "sync/afterLogin",
  async (_, { dispatch }) => {
    const { projects, tasks, docs } = await syncWithCloud();
    dispatch(setProjects(projects));
    dispatch(setTasks(tasks));
    // If you have a docs reducer, dispatch setDocs(docs)
    // For now, you might need to create a docs slice (similar to tasks)
    return { projects, tasks, docs };
  },
);

// Optional: sync on demand
export const syncManual = createAsyncThunk(
  "sync/manual",
  async (_, { dispatch }) => {
    const { projects, tasks, docs } = await syncWithCloud();
    dispatch(setProjects(projects));
    dispatch(setTasks(tasks));
    return { projects, tasks, docs };
  },
);
