import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Project } from "../types";

type ProjectState = {
  allProjects: Project[];
  currentProjectId: string | null;
};

const initialState: ProjectState = {
  allProjects: [],
  currentProjectId: null,
};

const projectSlice = createSlice({
  name: "projects",
  initialState,
  reducers: {
    setProjects(state, action: PayloadAction<Project[]>) {
      state.allProjects = action.payload;

      if (
        !state.currentProjectId &&
        action.payload.length > 0
      ) {
        state.currentProjectId =
          action.payload[0].id;
      }
    },

    setCurrentProject(
      state,
      action: PayloadAction<string>
    ) {
      state.currentProjectId = action.payload;
    },

    addProject(state, action: PayloadAction<Project>) {
      state.allProjects.unshift(action.payload);
      state.currentProjectId =
        action.payload.id;
    },

    updateProject(
      state,
      action: PayloadAction<Project>
    ) {
      const index = state.allProjects.findIndex(
        (project) =>
          project.id === action.payload.id
      );

      if (index !== -1) {
        state.allProjects[index] =
          action.payload;
      }
    },

    deleteProject(
      state,
      action: PayloadAction<string>
    ) {
      state.allProjects = state.allProjects.filter(
        (project) =>
          project.id !== action.payload
      );

      if (
        state.currentProjectId ===
        action.payload
      ) {
        state.currentProjectId =
          state.allProjects[0]?.id ?? null;
      }
    },
  },
});

export const {
  setProjects,
  setCurrentProject,
  addProject,
  updateProject,
  deleteProject,
} = projectSlice.actions;

export default projectSlice.reducer;