import { Routes, Route } from 'react-router-dom'
import AdminLogin from './pages/AdminLogin.jsx'
import VisitorForm from './pages/VisitorForm.jsx'
import Navigation from './pages/Navigation.jsx'
import SuperAdminDashboard from './components/admin/SuperAdminDashboard.jsx'
import UniversityAdminDashboard from './components/admin/UniversityAdminDashboard.jsx'
import InstituteAdminDashboard from './components/admin/InstituteAdminDashboard.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'


function App() {
  return (
    <Routes>
      <Route path="/admin" element={<AdminLogin />} />
      <Route path="/" element={<VisitorForm />} />
      <Route path="/navigation" element={<Navigation />} />

      {/* Protected admin routes */}
      <Route element={<ProtectedRoute allowedRoles={['super']} />}>
        <Route path="/admin/dashboard/super" element={<SuperAdminDashboard />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['university']} />}>
        <Route path="/admin/dashboard/university" element={<UniversityAdminDashboard />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['institute']} />}>
        <Route path="/admin/dashboard/institute" element={<InstituteAdminDashboard />} />
      </Route>

    </Routes>
  )
}

export default App