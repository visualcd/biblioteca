import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ModalProvider } from './context/ModalContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import InstallPage from './pages/InstallPage';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="text-white text-center mt-20">Se încarcă...</div>;
  if (!user) return <Navigate to="/login" />;
  return children;
};

import AdminDashboard from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard';
import AuthorDashboard from './pages/AuthorDashboard';
import LibrarianDashboard from './pages/LibrarianDashboard';

import ProfessorDashboard from './pages/ProfessorDashboard';

const DashboardRouter = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;

  const role = user.role ? user.role.toLowerCase() : 'unknown';

  console.log('Current User Role:', role);

  switch (role) {
    case 'admin': return <AdminDashboard />;
    case 'student': return <StudentDashboard />;
    case 'autor': return <AuthorDashboard />;
    case 'profesor': return <ProfessorDashboard />;
    case 'bibliotecar': return <LibrarianDashboard />;
    default:
      return (
        <div className="p-10 text-center">
          <h1 className="text-2xl font-bold text-red-500">Eroare Rol Utilizator</h1>
          <p>Rolul detectat "{role}" nu este recunoscut.</p>
          <p>Vă rugăm să contactați administratorul.</p>
          <StudentDashboard /> {/* Fallback temporarily */}
        </div>
      );
  }
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <ModalProvider>
          <div className="font-sans antialiased text-gray-900 bg-gray-900 h-full min-h-screen">
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/install" element={<InstallPage />} />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <DashboardRouter />
                </ProtectedRoute>
              } />
              <Route path="/" element={<Navigate to="/login" />} />
            </Routes>
          </div>
        </ModalProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
