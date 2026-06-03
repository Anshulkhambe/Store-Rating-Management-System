import { useState, useEffect } from 'react';
import { Star, Users, ArrowUpDown, ArrowUp, ArrowDown, Key, Loader2, Calendar } from 'lucide-react';
import { storeService, authService } from '../services/api';

function StoreDashboard() {
  // Store Owner specific states
  const [averageRating, setAverageRating] = useState(0);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sorting received ratings
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  // Password update states
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const data = await storeService.getStoreDashboard();
      setAverageRating(data.averageRating);
      
      // We sort the ratings list in Javascript based on state
      let ratingsList = [...data.ratings];
      sortData(ratingsList, sortBy, sortOrder);
      setRatings(ratingsList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const sortData = (list, field, order) => {
    const dir = order === 'asc' ? 1 : -1;
    list.sort((a, b) => {
      let valA = a[field];
      let valB = b[field];

      if (field === 'date') {
        valA = new Date(a.date).getTime();
        valB = new Date(b.date).getTime();
      } else if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }

      if (valA < valB) return -1 * dir;
      if (valA > valB) return 1 * dir;
      return 0;
    });
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  // Update sorting locally
  const handleSort = (field) => {
    const nextOrder = sortBy === field && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortBy(field);
    setSortOrder(nextOrder);
    
    let updatedList = [...ratings];
    sortData(updatedList, field, nextOrder);
    setRatings(updatedList);
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!password) {
      setPasswordError('Password is required');
      return;
    }

    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    // Password strength check
    const hasUpper = /[A-Z]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);
    if (password.length < 8 || password.length > 16 || !hasUpper || !hasSpecial) {
      setPasswordError('Password must be 8-16 characters and contain at least one uppercase letter and one special character');
      return;
    }

    setPasswordLoading(true);
    try {
      await authService.updatePassword(password);
      setPasswordSuccess('Password changed successfully!');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error(err);
      setPasswordError(err.response?.data?.error || 'Failed to update password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const renderSortIcon = (field) => {
    if (sortBy !== field) return <ArrowUpDown size={14} style={{ opacity: 0.4 }} />;
    return sortOrder === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />;
  };

  return (
    <div>
      <header className="mb-6">
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>Store Analytics Dashboard</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Review client feedback, calculate average rating statistics, and manage your credentials.</p>
      </header>

      <div className="section-split">
        {/* Left Side: Store Owner Data */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Average Rating indicator card */}
          <div className="glass-panel panel" style={{ padding: '2rem' }}>
            <h3 className="panel-title mb-6"><Star size={20} /> Overall Store Reputation</h3>
            
            {loading ? (
              <div className="text-center"><Loader2 className="animate-spin" style={{ margin: 'auto', animation: 'spin 1s linear infinite' }} /></div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', flexWrap: 'wrap', gap: '2rem' }}>
                <div className="rating-avg-large">
                  <span className="rating-number-lg">{averageRating > 0 ? averageRating.toFixed(2) : '0.00'}</span>
                  <span className="rating-label-lg">Average Rating</span>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div className="stars-display" style={{ fontSize: '2.5rem' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star} 
                        size={32} 
                        fill={star <= Math.round(averageRating) ? 'currentColor' : 'transparent'} 
                      />
                    ))}
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                    Calculated from <strong>{ratings.length}</strong> total customer reviews.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* User ratings list table */}
          <div className="glass-panel panel">
            <div className="panel-header">
              <h3 className="panel-title"><Users size={20} /> Customer Ratings Log</h3>
            </div>

            <div className="table-responsive">
              {loading ? (
                <div className="text-center p-4"><Loader2 className="animate-spin" style={{ margin: 'auto', animation: 'spin 1s linear infinite' }} /></div>
              ) : ratings.length === 0 ? (
                <div className="text-center p-4" style={{ color: 'var(--text-secondary)' }}>No ratings submitted yet for your store.</div>
              ) : (
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th className="sortable" onClick={() => handleSort('userName')}>
                        <div className="th-content">User Name {renderSortIcon('userName')}</div>
                      </th>
                      <th className="sortable" onClick={() => handleSort('userEmail')}>
                        <div className="th-content">Email {renderSortIcon('userEmail')}</div>
                      </th>
                      <th className="sortable" onClick={() => handleSort('userAddress')}>
                        <div className="th-content">Address {renderSortIcon('userAddress')}</div>
                      </th>
                      <th className="sortable" onClick={() => handleSort('rating')}>
                        <div className="th-content">Rating {renderSortIcon('rating')}</div>
                      </th>
                      <th className="sortable" onClick={() => handleSort('date')}>
                        <div className="th-content">Submission Date {renderSortIcon('date')}</div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {ratings.map(r => (
                      <tr key={r.ratingId}>
                        <td style={{ fontWeight: 600 }}>{r.userName}</td>
                        <td>{r.userEmail}</td>
                        <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={r.userAddress}>
                          {r.userAddress}
                        </td>
                        <td>
                          <span className="rating-badge">
                            <Star size={14} fill="currentColor" />
                            {r.rating}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Calendar size={14} />
                            {new Date(r.date).toLocaleString()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

        </div>

        {/* Right Side: Account Settings (Password Update) */}
        <div>
          <div className="glass-panel panel" style={{ position: 'sticky', top: '100px' }}>
            <div className="panel-header" style={{ marginBottom: '1.25rem' }}>
              <h3 className="panel-title"><Key size={20} /> Update Password</h3>
            </div>

            {passwordError && (
              <div className="form-error mb-4" style={{ padding: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '4px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                {passwordError}
              </div>
            )}

            {passwordSuccess && (
              <div style={{ color: 'var(--color-success)', fontSize: '0.875rem', fontWeight: 500, padding: '0.5rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '4px', border: '1px solid rgba(16, 185, 129, 0.2)', marginBottom: '1rem' }}>
                ✓ {passwordSuccess}
              </div>
            )}

            <form onSubmit={handleUpdatePassword}>
              <div className="form-group">
                <label className="form-label" htmlFor="newPassword">New Password</label>
                <input
                  id="newPassword"
                  type="password"
                  className="form-control"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <div className="form-helper" style={{ fontSize: '0.75rem', flexDirection: 'column', gap: '2px', alignItems: 'flex-start' }}>
                  <span>• Length 8-16 characters</span>
                  <span>• 1+ uppercase letter</span>
                  <span>• 1+ special character</span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="confirmPassword">Confirm New Password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  className="form-control"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.75rem' }} disabled={passwordLoading}>
                {passwordLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={16} style={{ animation: 'spin 1s linear infinite' }} />
                    Saving...
                  </>
                ) : (
                  <>
                    <Key size={16} />
                    Change Password
                  </>
                )}
              </button>
            </form>
          </div>
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

export default StoreDashboard;
