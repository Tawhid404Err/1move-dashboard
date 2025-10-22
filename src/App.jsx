import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Registration from './pages/Registration'
import Login from './pages/Login'
import AdminDashboard from './pages/AdminDashboard'
import AffiliateProfile from './pages/AffiliateProfile'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Registration />} />
        <Route path="/login/:role" element={<Login />} />
        <Route path="/login" element={<Navigate to="/login/admin" replace />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/affiliate/profile" element={<AffiliateProfile />} />
      </Routes>
    </Router>
  )
}

export default App
