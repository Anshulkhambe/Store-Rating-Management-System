import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { Star, LogOut } from 'lucide-react';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import StoreDashboard from './pages/StoreDashboard';
import { authService } from './services/api';

function NavigationHeader({ user, handleLogout }) {
  const navigate = useNavigate();
  if (!user) return null;

  return (
    <nav className="navbar">
      <Link to="/" className="nav-brand">
        <Star size={22} fill="currentColor" style={{ color: 'var(--color-warning)' }} />
        <span>Store Rating Hub</span>
      </Link>
      
      <div className="nav-links">
        <div className="user-info">
          <span className="user-name">{user.name}</span>
          <span className="user-role-badge">
            {user.role === 'admin' ? 'Administrator' : user.role === 'store_owner' ? 'Store Owner' : 'Normal User'}
          </span>
        </div>
        
        <button 
          onClick={() => handleLogout(navigate)} 
          className="btn btn-secondary" 
          style={{ padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem' }}
        >
          <LogOut size={14} />
          Sign Out
        </button>
      </div>
    </nav>
  );
}

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const handleLogout = (navigate) => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  useEffect(() => {
    const verifySession = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const profile = await authService.getMe();
          setUser(profile);
          localStorage.setItem('user', JSON.stringify(profile));
        } catch (err) {
          console.error('Session validation failed, resetting credentials:', err.message);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
      }
    };
    verifySession();
  }, []);

  return (
    <Router>
      <div className="app-container">
        <NavigationHeader user={user} handleLogout={handleLogout} />
        
        <main className="main-content">
          <Routes>
            <Route 
              path="/login" 
              element={!user ? <Login setUser={setUser} /> : <Navigate to={user.role === 'admin' ? '/admin' : user.role === 'store_owner' ? '/store' : '/user'} />} 
            />
            <Route 
              path="/register" 
              element={!user ? <Register setUser={setUser} /> : <Navigate to="/user" />} 
            />

            <Route 
              path="/admin" 
              element={user && user.role === 'admin' ? <AdminDashboard /> : <Navigate to="/login" />} 
            />

            <Route 
              path="/store" 
              element={user && user.role === 'store_owner' ? <StoreDashboard /> : <Navigate to="/login" />} 
            />

            <Route 
              path="/user" 
              element={user && user.role === 'user' ? <UserDashboard /> : <Navigate to="/login" />} 
            />

            <Route 
              path="*" 
              element={<Navigate to={user ? (user.role === 'admin' ? '/admin' : user.role === 'store_owner' ? '/store' : '/user') : '/login'} />} 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
