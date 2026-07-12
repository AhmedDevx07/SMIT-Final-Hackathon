import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import TechnicianDashboard from './pages/TechDashboard';
import PublicAssetPage from './pages/PublicAssetPage';
import AssetDetails from './pages/AssetDetails';
import PrivateRoute from './routes/PrivateRoute';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/asset/:assetCode" element={<PublicAssetPage />} />

      <Route
        path="/admin"
        element={
          <PrivateRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </PrivateRoute>
        }
      />

      <Route
        path="/admin/asset/:id"
        element={
          <PrivateRoute allowedRoles={['admin']}>
            <AssetDetails />
          </PrivateRoute>
        }
      />

      <Route
        path="/technician"
        element={
          <PrivateRoute allowedRoles={['technician']}>
            <TechnicianDashboard />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

export default App;