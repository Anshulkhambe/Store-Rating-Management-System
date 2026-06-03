import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, MapPin, Eye, EyeOff, Loader2 } from 'lucide-react';
import { authService } from '../services/api';

function Register({ setUser }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const navigate = useNavigate();

  // Helper check for password format
  const checkPasswordStrength = (pass) => {
    const hasUpper = /[A-Z]/.test(pass);
    const hasSpecial = /[^A-Za-z0-9]/.test(pass);
    return {
      length: pass.length >= 8 && pass.length <= 16,
      upper: hasUpper,
      special: hasSpecial,
      valid: pass.length >= 8 && pass.length <= 16 && hasUpper && hasSpecial
    };
  };

  const strength = checkPasswordStrength(password);

  const validateForm = () => {
    const errors = {};

    // Name: Min 20, Max 60
    if (!name) {
      errors.name = 'Name is required';
    } else if (name.length < 20) {
      errors.name = `Name must be at least 20 characters (currently ${name.length}/20). Try adding full middle/last names or titles.`;
    } else if (name.length > 60) {
      errors.name = `Name cannot exceed 60 characters (currently ${name.length}/60).`;
    }

    // Email check
    if (!email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Address check
    if (!address) {
      errors.address = 'Address is required';
    } else if (address.length > 400) {
      errors.address = `Address cannot exceed 400 characters (currently ${address.length}/400).`;
    }

    // Password strength check
    if (!password) {
      errors.password = 'Password is required';
    } else if (!strength.valid) {
      errors.password = 'Password must meet all complexity requirements below';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      await authService.register({ name, email, password, address });
      navigate('/login', { state: { successMessage: 'Registration successful! Please sign in with your credentials.' } });
    } catch (error) {
      console.error(error);
      const data = error.response?.data;
      if (data?.errors) {
        setFieldErrors(data.errors);
      } else {
        setErrorMessage(data?.error || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Name length bar percentage
  const namePercent = Math.min((name.length / 20) * 100, 100);
  const nameBarColor = name.length < 20 ? 'var(--color-danger)' : 'var(--color-success)';

  return (
    <div className="auth-wrapper">
      <div className="auth-card glass-panel" style={{ maxWidth: '520px' }}>
        <div className="auth-header">
          <h2 className="auth-title">Create Account</h2>
          <p className="auth-subtitle">Register as a normal user to submit and review store ratings</p>
        </div>

        {errorMessage && (
          <div className="alert-toast toast-error mb-4" style={{ position: 'static', animation: 'none' }}>
            <span>⚠️ {errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Name Field with dynamic UI checker */}
          <div className="form-group">
            <label className="form-label" htmlFor="name">Full Name</label>
            <div className="search-input-wrapper" style={{ minWidth: 'auto' }}>
              <User className="search-icon" size={18} />
              <input
                id="name"
                type="text"
                className="form-control search-input"
                placeholder="e.g. Johnathan Alexander Smith"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            {name.length > 0 && (
              <>
                <div className="validation-bar-container">
                  <div 
                    className="validation-bar" 
                    style={{ 
                      width: `${namePercent}%`, 
                      backgroundColor: nameBarColor 
                    }}
                  />
                </div>
                <div className="form-helper">
                  <span>Required: 20-60 characters</span>
                  <span>{name.length} chars</span>
                </div>
              </>
            )}
            {fieldErrors.name && <span className="form-error">{fieldErrors.name}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <div className="search-input-wrapper" style={{ minWidth: 'auto' }}>
              <Mail className="search-icon" size={18} />
              <input
                id="email"
                type="email"
                className="form-control search-input"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            {fieldErrors.email && <span className="form-error">{fieldErrors.email}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="address">Address</label>
            <div className="search-input-wrapper" style={{ minWidth: 'auto' }}>
              <MapPin className="search-icon" size={18} style={{ top: '1.2rem', transform: 'none' }} />
              <textarea
                id="address"
                className="form-control search-input"
                placeholder="Enter your complete mailing address..."
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                style={{ paddingLeft: '2.5rem', resize: 'vertical' }}
              />
            </div>
            <div className="form-helper">
              <span>Maximum 400 characters</span>
              <span>{address.length}/400</span>
            </div>
            {fieldErrors.address && <span className="form-error">{fieldErrors.address}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <div className="search-input-wrapper" style={{ minWidth: 'auto' }}>
              <Lock className="search-icon" size={18} />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="form-control search-input"
                placeholder="Choose a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingRight: '2.5rem' }}
              />
              <button
                type="button"
                className="btn-icon"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '0.5rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  padding: '2px',
                  color: 'var(--text-secondary)'
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            
            {/* Realtime password indicators */}
            <div className="mt-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.75rem' }}>
              <div style={{ color: strength.length ? 'var(--color-success)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                {strength.length ? '✓' : '○'} 8 - 16 Characters
              </div>
              <div style={{ color: strength.upper ? 'var(--color-success)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                {strength.upper ? '✓' : '○'} 1+ Uppercase Letter
              </div>
              <div style={{ color: strength.special ? 'var(--color-success)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                {strength.special ? '✓' : '○'} 1+ Special Character
              </div>
            </div>
            {fieldErrors.password && <span className="form-error">{fieldErrors.password}</span>}
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem' }} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={18} style={{ animation: 'spin 1s linear infinite' }} />
                Creating Account...
              </>
            ) : (
              <>
                <UserPlus size={18} />
                Sign Up
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? 
          <Link to="/login" className="auth-link">Sign In</Link>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default Register;
