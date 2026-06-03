import { useState, useEffect } from 'react';
import { Store, Star, Search, ArrowUpDown, ArrowUp, ArrowDown, Key, Loader2 } from 'lucide-react';
import { storeService, authService } from '../services/api';

function UserDashboard() {
  // Store list states
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  // Password update states
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Rating submitting states
  const [ratingLoadingStoreId, setRatingLoadingStoreId] = useState(null);

  // General Notification States
  const [toastMessage, setToastMessage] = useState(null);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadStores = async () => {
    setLoading(true);
    try {
      const params = {
        search,
        sortBy,
        sortOrder
      };
      const data = await storeService.getStoresForUser(params);
      setStores(data);
    } catch (err) {
      console.error(err);
      triggerToast('Failed to load store list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStores();
  }, [search, sortBy, sortOrder]);

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

    // Check strength
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

  const handleRatingSubmit = async (storeId, score) => {
    setRatingLoadingStoreId(storeId);
    try {
      await storeService.submitRating(storeId, score);
      triggerToast('Rating submitted successfully!');
      // Refresh listings
      loadStores();
    } catch (err) {
      console.error(err);
      triggerToast('Failed to submit rating.');
    } finally {
      setRatingLoadingStoreId(null);
    }
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const renderSortIcon = (column) => {
    if (sortBy !== column) return <ArrowUpDown size={14} style={{ opacity: 0.4 }} />;
    return sortOrder === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />;
  };

  return (
    <div>
      {toastMessage && (
        <div className="alert-toast toast-success" style={{ zIndex: 1050 }}>
          <span>{toastMessage}</span>
        </div>
      )}

      <header className="mb-6">
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>Welcome to Store Ratings</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Browse registered stores, view overall community feedback, and submit or modify your ratings.</p>
      </header>

      <div className="section-split">
        {/* Left Side: Store Listings */}
        <div className="glass-panel panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="panel-header">
            <h3 className="panel-title"><Store size={20} /> Registered Stores</h3>
          </div>

          <div className="filter-bar">
            <div className="search-input-wrapper">
              <Search size={16} className="search-icon" />
              <input 
                type="text" 
                className="form-control search-input" 
                placeholder="Search stores by Name or Address..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="table-responsive">
            {loading ? (
              <div className="text-center p-4"><Loader2 className="animate-spin" style={{ margin: 'auto', animation: 'spin 1s linear infinite' }} /></div>
            ) : stores.length === 0 ? (
              <div className="text-center p-4" style={{ color: 'var(--text-secondary)' }}>No stores found.</div>
            ) : (
              <table className="custom-table">
                <thead>
                  <tr>
                    <th className="sortable" onClick={() => handleSort('name')}>
                      <div className="th-content">Store Name {renderSortIcon('name')}</div>
                    </th>
                    <th className="sortable" onClick={() => handleSort('address')}>
                      <div className="th-content">Address {renderSortIcon('address')}</div>
                    </th>
                    <th className="sortable" onClick={() => handleSort('overallRating')}>
                      <div className="th-content">Overall Rating {renderSortIcon('overallRating')}</div>
                    </th>
                    <th className="sortable" onClick={() => handleSort('userRating')}>
                      <div className="th-content">Your Rating {renderSortIcon('userRating')}</div>
                    </th>
                    <th>Rate Store</th>
                  </tr>
                </thead>
                <tbody>
                  {stores.map(s => (
                    <tr key={s.id}>
                      <td style={{ fontWeight: 600 }}>{s.name}</td>
                      <td style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{s.address}</td>
                      <td>
                        <span className="rating-badge">
                          <Star size={14} fill="currentColor" />
                          {s.overallRating > 0 ? s.overallRating.toFixed(1) : 'Unrated'}
                        </span>
                      </td>
                      <td>
                        {s.userRating > 0 ? (
                          <span className="rating-badge" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#a5b4fc', borderColor: 'rgba(99, 102, 241, 0.25)' }}>
                            <Star size={14} fill="currentColor" />
                            {s.userRating} / 5
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Not Rated</span>
                        )}
                      </td>
                      <td>
                        {ratingLoadingStoreId === s.id ? (
                          <Loader2 className="animate-spin" size={18} style={{ animation: 'spin 1s linear infinite' }} />
                        ) : (
                          <div className="rating-selector">
                            {[1, 2, 3, 4, 5].map((score) => (
                              <button
                                key={score}
                                type="button"
                                className={`star-btn ${s.userRating >= score ? 'active' : ''}`}
                                onClick={() => handleRatingSubmit(s.id, score)}
                                title={`Rate ${score} stars`}
                              >
                                <Star 
                                  size={16} 
                                  fill={s.userRating >= score ? 'currentColor' : 'transparent'} 
                                />
                              </button>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right Side: Account Actions (Password Update) */}
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

export default UserDashboard;
