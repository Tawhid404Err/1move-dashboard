import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Registration from './pages/Registration'
import Login from './pages/Login'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Registration />} />
        <Route path="/login/:role" element={<Login />} />
        <Route path="/login" element={<Navigate to="/login/admin" replace />} />
      </Routes>
    </Router>
  )
}

export default App
