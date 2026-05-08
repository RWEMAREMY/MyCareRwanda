import { Navigate, Route, Routes } from 'react-router-dom'
import AuthPage from './pages/AuthPage'
import HomePage from './pages/HomePage'
import DashboardPage from './pages/dashboard'
import CaretakersPage from './pages/CaretakersPage'
import AboutUsPage from './pages/AboutUsPage'
import AdminRoleManagementPage from './pages/AdminRoleManagementPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/dashboard/admin-role-management" element={<AdminRoleManagementPage />} />
      <Route path="/caretakers" element={<CaretakersPage />} />
      <Route path="/about" element={<AboutUsPage />} />
      <Route path="/about-us" element={<AboutUsPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
