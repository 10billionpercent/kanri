import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface UserState {
  name: string;
  username?: string;
  authMode: "local" | "account" | "google";
}

const initialState: UserState | null = null;

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser(_state, action: PayloadAction<UserState | null>) {
      return action.payload;
    },
    clearUser() {
      return null;
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;