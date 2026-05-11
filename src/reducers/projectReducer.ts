import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Project } from "../types";

const initialState: Project[] = [];

const projectSlice = createSlice({
  name: "projects",
  initialState,
  reducers: {
    setProjects(_state, action: PayloadAction<Project[]>) {
      return action.payload;
    },

    addProject(state, action: PayloadAction<Project>) {
      state.push(action.payload);
    },

    updateProject(state, action: PayloadAction<Project>) {
      const index = state.findIndex(
        (project) => project.id === action.payload.id
      );

      if (index !== -1) {
        state[index] = action.payload;
      }
    },

    deleteProject(state, action: PayloadAction<string>) {
      return state.filter(
        (project) => project.id !== action.payload
      );
    },
  },
});

export const {
  setProjects,
  addProject,
  updateProject,
  deleteProject,
} = projectSlice.actions;

export default projectSlice.reducer;