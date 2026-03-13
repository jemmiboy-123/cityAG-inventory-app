import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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

// Placeholder components for other pages
const Reports = () => <div className="card"><h2>Reports</h2><p>Inventory reports and analytics.</p></div>;
const Settings = () => <div className="card"><h2>Settings</h2><p>System settings and preferences.</p></div>;

// Component to handle layout with sidebar
const AppLayout = ({ children, darkMode, toggleDarkMode }) => {
  return (
    <div className="app-container">
      <Sidebar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

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
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes (Authenticated placeholder) */}
        <Route path="/" element={
          <AppLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
            <Dashboard />
          </AppLayout>
        } />
        <Route path="/inventory" element={
          <AppLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
            <Inventory />
          </AppLayout>
        } />
        <Route path="/items/new" element={
          <AppLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
            <ItemForm />
          </AppLayout>
        } />
        <Route path="/borrow/new" element={
          <AppLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
            <BorrowForm />
          </AppLayout>
        } />
        <Route path="/borrowed" element={
          <AppLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
            <BorrowedItems />
          </AppLayout>
        } />
        <Route path="/categories" element={
          <AppLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
            <Categories />
          </AppLayout>
        } />
        <Route path="/accounting" element={
          <AppLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
            <Accounting />
          </AppLayout>
        } />
        <Route path="/reports" element={
          <AppLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
            <Reports />
          </AppLayout>
        } />
        <Route path="/settings" element={
          <AppLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
            <Settings />
          </AppLayout>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
