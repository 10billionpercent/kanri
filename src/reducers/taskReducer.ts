import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Task } from "../types";

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
      const index = state.findIndex(
        (task) => task.id === action.payload.id
      );

      if (index !== -1) {
        state[index] = action.payload;
      }
    },

    deleteTask(state, action: PayloadAction<string>) {
      return state.filter(
        (task) => task.id !== action.payload
      );
    },
  },
});

export const {
  setTasks,
  addTask,
  updateTask,
  deleteTask,
} = taskSlice.actions;

export default taskSlice.reducer;