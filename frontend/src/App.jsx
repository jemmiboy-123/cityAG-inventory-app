import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import ItemForm from './pages/ItemForm';
import Categories from './pages/Categories';
import Accounting from './pages/Accounting';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PreferencesProvider } from './context/PreferencesContext';

const AppLayout = ({ children, darkMode, toggleDarkMode }) => (
  <div className="app-container">
    <Sidebar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
    <main className="main-content">
      {children}
    </main>
  </div>
);

const ProtectedRoute = ({ children, darkMode, toggleDarkMode }) => {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <AppLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
      {children}
    </AppLayout>
  );
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (user) return <Navigate to="/" replace />;

  return children;
};

function AppRoutes() {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');

  useEffect(() => {
    if (darkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Keep sidebar's darkMode in sync when Settings page changes the theme.
  useEffect(() => {
    const handler = () => setDarkMode(localStorage.getItem('theme') === 'dark');
    window.addEventListener('theme-changed', handler);
    return () => window.removeEventListener('theme-changed', handler);
  }, []);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

      <Route path="/" element={<ProtectedRoute darkMode={darkMode} toggleDarkMode={toggleDarkMode}><Dashboard /></ProtectedRoute>} />
      <Route path="/inventory" element={<ProtectedRoute darkMode={darkMode} toggleDarkMode={toggleDarkMode}><Inventory /></ProtectedRoute>} />
      <Route path="/items/new" element={<ProtectedRoute darkMode={darkMode} toggleDarkMode={toggleDarkMode}><ItemForm /></ProtectedRoute>} />
      <Route path="/categories" element={<ProtectedRoute darkMode={darkMode} toggleDarkMode={toggleDarkMode}><Categories /></ProtectedRoute>} />
      <Route path="/accounting" element={<ProtectedRoute darkMode={darkMode} toggleDarkMode={toggleDarkMode}><Accounting /></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute darkMode={darkMode} toggleDarkMode={toggleDarkMode}><Reports /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute darkMode={darkMode} toggleDarkMode={toggleDarkMode}><Settings /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <PreferencesProvider>
          <AppRoutes />
        </PreferencesProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
