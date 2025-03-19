import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import ActiveCalls from './pages/ActiveCalls';
import Analytics from './pages/Analytics';
import Team from './pages/Team';
import Auth from './components/Auth';
import { firebaseService } from './services/FirebaseService';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = firebaseService.onAuthStateChange((user) => {
      setIsAuthenticated(!!user);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Landing />} />
        <Route
          path="/auth"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Auth onAuthStateChange={setIsAuthenticated} />
            )
          }
        />

        {/* Protected routes */}
        <Route
          path="/*"
          element={
            isAuthenticated ? (
              <Layout />
            ) : (
              <Navigate to="/" replace />
            )
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="active-calls" element={<ActiveCalls />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="team" element={<Team />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
