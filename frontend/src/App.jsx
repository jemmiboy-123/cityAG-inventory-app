import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import ItemForm from './pages/ItemForm';
import BorrowForm from './pages/BorrowForm';
import Categories from './pages/Categories';
import BorrowedItems from './pages/BorrowedItems';
import Accounting from './pages/Accounting';
import Login from './pages/Login';
import Register from './pages/Register';
import { AuthProvider, useAuth } from './context/AuthContext';

const Reports = () => <div className="card"><h2>Reports</h2><p>Inventory reports and analytics.</p></div>;
const Settings = () => <div className="card"><h2>Settings</h2><p>System settings and preferences.</p></div>;

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

  const toggleDarkMode = () => setDarkMode(!darkMode);

  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

      <Route path="/" element={<ProtectedRoute darkMode={darkMode} toggleDarkMode={toggleDarkMode}><Dashboard /></ProtectedRoute>} />
      <Route path="/inventory" element={<ProtectedRoute darkMode={darkMode} toggleDarkMode={toggleDarkMode}><Inventory /></ProtectedRoute>} />
      <Route path="/items/new" element={<ProtectedRoute darkMode={darkMode} toggleDarkMode={toggleDarkMode}><ItemForm /></ProtectedRoute>} />
      <Route path="/borrow/new" element={<ProtectedRoute darkMode={darkMode} toggleDarkMode={toggleDarkMode}><BorrowForm /></ProtectedRoute>} />
      <Route path="/borrowed" element={<ProtectedRoute darkMode={darkMode} toggleDarkMode={toggleDarkMode}><BorrowedItems /></ProtectedRoute>} />
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
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
