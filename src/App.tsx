import { Navigate, Route, Routes } from 'react-router-dom'
import Project from './pages/Project'
import Signup from './pages/Signup'

function App() {
  return (
    <Routes>
      <Route path="/signup" element={<Signup />} />
      <Route path="/project" element={<Project />} />
      <Route path="*" element={<Navigate to="/signup" replace />} />
    </Routes>
  )
}

export default App
