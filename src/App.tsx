import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "./store";
import { setUser } from "./reducers/userReducer";
import { loadUser } from "./services/db";

import Signup from "./pages/Signup";
import ProjectPage from "./pages/ProjectPage"; 

function App() {
  const user = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    async function restoreUser() {
      const savedUser = await loadUser();
      dispatch(setUser(savedUser));
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
