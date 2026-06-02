import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type { Project } from "../types";
import {
  fetchProjects,
  createProject,
  updateProject,
  deleteProject,
  type BackendProject,
} from "../services/api";

function fromBackend(p: BackendProject): Project {
  return {
    id: p.id,
    name: p.name,
    description: p.description ?? undefined,
    createdAt: new Date(p.created_at).toISOString(),
    updatedAt: new Date(p.updated_at).toISOString(),
  };
}

export const loadProjects = createAsyncThunk("projects/load", async () => {
  const data = await fetchProjects();
  return data.map(fromBackend);
});

export const addProjectThunk = createAsyncThunk(
  "projects/add",
  async (
    project: Omit<Project, "id" | "createdAt" | "updatedAt"> & { id?: string },
  ) => {
    const now = Date.now();
    const newProj = {
      id: project.id,
      name: project.name,
      description: project.description,
      createdAt: now,
      updatedAt: now,
    };
    await createProject(newProj);
    return fromBackend({
      ...newProj,
      created_at: now,
      updated_at: now,
    } as BackendProject);
  },
);

export const updateProjectThunk = createAsyncThunk(
  "projects/update",
  async (project: Project) => {
    await updateProject(project.id, {
      name: project.name,
      description: project.description,
      updatedAt: new Date(project.updatedAt).getTime(),
    });
    return project;
  },
);

export const deleteProjectThunk = createAsyncThunk(
  "projects/delete",
  async (id: string) => {
    await deleteProject(id);
    return id;
  },
);

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
    setCurrentProject(state, action: PayloadAction<string>) {
      state.currentProjectId = action.payload;
    },
    // Fallback manual setters (optional)
    setProjects(state, action: PayloadAction<Project[]>) {
      state.allProjects = action.payload;
      if (!state.currentProjectId && action.payload.length > 0) {
        state.currentProjectId = action.payload[0].id;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadProjects.fulfilled, (state, action) => {
        state.allProjects = action.payload;
        if (!state.currentProjectId && action.payload.length > 0) {
          state.currentProjectId = action.payload[0].id;
        }
      })
      .addCase(addProjectThunk.fulfilled, (state, action) => {
        state.allProjects.unshift(action.payload);
        state.currentProjectId = action.payload.id;
      })
      .addCase(updateProjectThunk.fulfilled, (state, action) => {
        const index = state.allProjects.findIndex(
          (p) => p.id === action.payload.id,
        );
        if (index !== -1) state.allProjects[index] = action.payload;
      })
      .addCase(deleteProjectThunk.fulfilled, (state, action) => {
        state.allProjects = state.allProjects.filter(
          (p) => p.id !== action.payload,
        );
        if (state.currentProjectId === action.payload) {
          state.currentProjectId = state.allProjects[0]?.id ?? null;
        }
      });
  },
});

export const { setCurrentProject, setProjects } = projectSlice.actions;
export default projectSlice.reducer;
