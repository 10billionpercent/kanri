import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "./store";
import { setUser } from "./reducers/userReducer";
import { getMe } from "./services/api";

import Signup from "./pages/Signup";
import ProjectPage from "./pages/ProjectPage";

function App() {
  const user = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    async function restoreUser() {
      const token = localStorage.getItem("nagare_token");
      if (!token) {
        dispatch(setUser(null));
        return;
      }
      try {
        const userData = await getMe();
        if (userData) {
          dispatch(
            setUser({
              name: userData.display_name || userData.username,
              username: userData.username,
              authMode: "account",
            }),
          );
        } else {
          dispatch(setUser(null));
          localStorage.removeItem("nagare_token");
        }
      } catch {
        dispatch(setUser(null));
        localStorage.removeItem("nagare_token");
      }
    }

    restoreUser();
  }, [dispatch]);

  return (
    <Routes>
      <Route
        path="/signup"
        element={user ? <Navigate to="/project" replace /> : <Signup />}
      />
      <Route
        path="/project"
        element={user ? <ProjectPage /> : <Navigate to="/signup" replace />}
      />
      <Route
        path="*"
        element={<Navigate to={user ? "/project" : "/signup"} replace />}
      />
    </Routes>
  );
}

export default App;
