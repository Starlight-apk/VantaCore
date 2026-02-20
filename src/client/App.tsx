import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Overview from './pages/Overview';
import AppStore from './pages/AppStore';
import FileManager from './pages/FileManager';
import Terminal from './pages/Terminal';
import Docker from './pages/Docker';
import Settings from './pages/Settings';
import Layout from './components/layout/Layout';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!localStorage.getItem('token');
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (token: string) => {
    localStorage.setItem('token', token);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to="/" replace />
          ) : (
            <Login onLogin={handleLogin} />
          )
        }
      />
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Layout onLogout={handleLogout}>
              <Routes>
                <Route index element={<Overview />} />
                <Route path="apps" element={<AppStore />} />
                <Route path="files" element={<FileManager />} />
                <Route path="terminal" element={<Terminal />} />
                <Route path="docker" element={<Docker />} />
                <Route path="settings" element={<Settings />} />
              </Routes>
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
}

export default App;
