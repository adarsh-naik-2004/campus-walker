import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'  // Add this import
import AdminLogin from './pages/AdminLogin.jsx'
import VisitorForm from './pages/VisitorForm.jsx'
import SuperAdminDashboard from './components/admin/SuperAdminDashboard.jsx'
import UniversityAdminDashboard from './components/admin/UniversityAdminDashboard.jsx'
import InstituteAdminDashboard from './components/admin/InstituteAdminDashboard.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import ARNavigator from './pages/ARNavigator.jsx'

function App() {
  return (
    <>
      <Routes>
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/" element={<VisitorForm />} />
        <Route path="/navigation" element={<ARNavigator />} />

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

      {/* Add the Toaster component - this is REQUIRED for toast notifications to work */}
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          // Define default options
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
            fontSize: '14px',
            borderRadius: '8px',
            padding: '12px 16px',
          },
          // Specific options for different types
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
            style: {
              background: '#10b981',
              color: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
            style: {
              background: '#ef4444',
              color: '#fff',
            },
          },
        }}
      />
    </>
  )
}

export default App