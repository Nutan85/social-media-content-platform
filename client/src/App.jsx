import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ContentList from './pages/ContentList';
import CreateContent from './pages/CreateContent';
import EditContent from './pages/EditContent';
import ContentDetail from './pages/ContentDetail';
import ReviewPage from './pages/ReviewPage';
import UserManagement from './pages/UserManagement';

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />

      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/content" element={<ContentList />} />
        <Route
          path="/content/create"
          element={
            <ProtectedRoute roles={['admin', 'content_creator']}>
              <CreateContent />
            </ProtectedRoute>
          }
        />
        <Route path="/content/:id" element={<ContentDetail />} />
        <Route
          path="/content/:id/edit"
          element={
            <ProtectedRoute roles={['admin', 'content_creator']}>
              <EditContent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reviews"
          element={
            <ProtectedRoute roles={['admin', 'reviewer']}>
              <ReviewPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute roles={['admin']}>
              <UserManagement />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} />} />
    </Routes>
  );
}
