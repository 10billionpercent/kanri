import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface UserState {
  name: string;
  username?: string;
  authMode: "local" | "account" | "google";
}

const initialState: UserState | null = null;

const userSlice = createSlice({
  name: "user",
  initialState: initialState as UserState | null,
  reducers: {
    setUser(
      _state,
      action: PayloadAction<UserState | null>
    ) {
      return action.payload;
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    clearUser(_state) {
      return null;
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;