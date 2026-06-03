import { useState, useEffect } from 'react';
import { 
  Users, Store, Star, UserPlus, Search, 
  ArrowUpDown, ArrowUp, ArrowDown, Eye, X, Loader2 
} from 'lucide-react';
import { adminService } from '../services/api';

function AdminDashboard() {
  // Statistics States
  const [stats, setStats] = useState({ totalUsers: 0, totalStores: 0, totalRatings: 0 });
  const [statsLoading, setStatsLoading] = useState(true);

  // Users Table States
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('');
  const [userSortBy, setUserSortBy] = useState('name');
  const [userSortOrder, setUserSortOrder] = useState('asc');

  // Stores Table States
  const [stores, setStores] = useState([]);
  const [storesLoading, setStoresLoading] = useState(true);
  const [storeSearch, setStoreSearch] = useState('');
  const [storeSortBy, setStoreSortBy] = useState('name');
  const [storeSortOrder, setStoreSortOrder] = useState('asc');

  // Add User Form States
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formRole, setFormRole] = useState('user');
  
  const [formErrors, setFormErrors] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);
  const [successToast, setSuccessToast] = useState('');
  const [errorToast, setErrorToast] = useState('');

  // Details Modal States
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Load Dashboard Data
  const loadStats = async () => {
    try {
      const data = await adminService.getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setStatsLoading(false);
    }
  };

  const loadUsers = async () => {
    setUsersLoading(true);
    try {
      const params = {
        search: userSearch,
        sortBy: userSortBy,
        sortOrder: userSortOrder,
      };
      if (userRoleFilter) params.role = userRoleFilter;

      const data = await adminService.getUsers(params);
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setUsersLoading(false);
    }
  };

  const loadStores = async () => {
    setStoresLoading(true);
    try {
      const params = {
        search: storeSearch,
        sortBy: storeSortBy,
        sortOrder: storeSortOrder
      };
      const data = await adminService.getStores(params);
      setStores(data);
    } catch (err) {
      console.error(err);
    } finally {
      setStoresLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    loadUsers();
  }, [userSearch, userRoleFilter, userSortBy, userSortOrder]);

  useEffect(() => {
    loadStores();
  }, [storeSearch, storeSortBy, storeSortOrder]);

  // Handle User Details Modal Open
  const handleViewDetails = async (userId) => {
    setModalLoading(true);
    try {
      const data = await adminService.getUserDetails(userId);
      setSelectedUser(data);
    } catch (err) {
      console.error(err);
      triggerToast('error', 'Failed to retrieve user details.');
    } finally {
      setModalLoading(false);
    }
  };

  const triggerToast = (type, msg) => {
    if (type === 'success') {
      setSuccessToast(msg);
      setTimeout(() => setSuccessToast(''), 4000);
    } else {
      setErrorToast(msg);
      setTimeout(() => setErrorToast(''), 4000);
    }
  };

  // Form validations client side
  const validateForm = () => {
    const errors = {};
    if (!formName) {
      errors.name = 'Name is required';
    } else if (formName.length < 20 || formName.length > 60) {
      errors.name = 'Name must be 20 to 60 characters';
    }

    if (!formEmail) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formEmail)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formAddress) {
      errors.address = 'Address is required';
    } else if (formAddress.length > 400) {
      errors.address = 'Address cannot exceed 400 characters';
    }

    // Password validations
    if (!formPassword) {
      errors.password = 'Password is required';
    } else if (formPassword.length < 8 || formPassword.length > 16) {
      errors.password = 'Password must be 8-16 characters';
    } else {
      const hasUpper = /[A-Z]/.test(formPassword);
      const hasSpecial = /[^A-Za-z0-9]/.test(formPassword);
      if (!hasUpper || !hasSpecial) {
        errors.password = 'Password must include at least one uppercase letter and one special character';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitLoading(true);
    try {
      await adminService.createUser({
        name: formName,
        email: formEmail,
        password: formPassword,
        address: formAddress,
        role: formRole
      });
      
      triggerToast('success', 'User added successfully!');
      
      // Clear form fields
      setFormName('');
      setFormEmail('');
      setFormPassword('');
      setFormAddress('');
      setFormRole('user');
      setFormErrors({});

      // Reload lists & stats
      loadStats();
      loadUsers();
      loadStores();
    } catch (error) {
      console.error(error);
      const data = error.response?.data;
      if (data?.errors) {
        setFormErrors(data.errors);
      } else {
        triggerToast('error', data?.error || 'Failed to create user.');
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  // Sorting handlers
  const handleUserSort = (column) => {
    if (userSortBy === column) {
      setUserSortOrder(userSortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setUserSortBy(column);
      setUserSortOrder('asc');
    }
  };

  const handleStoreSort = (column) => {
    if (storeSortBy === column) {
      setStoreSortOrder(storeSortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setStoreSortBy(column);
      setStoreSortOrder('asc');
    }
  };

  const renderSortIcon = (table, column) => {
    const sortBy = table === 'user' ? userSortBy : storeSortBy;
    const sortOrder = table === 'user' ? userSortOrder : storeSortOrder;

    if (sortBy !== column) return <ArrowUpDown size={14} style={{ opacity: 0.4 }} />;
    return sortOrder === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />;
  };

  return (
    <div>
      {/* Toast Alert popups */}
      {successToast && <div className="alert-toast toast-success"><span>✓ {successToast}</span></div>}
      {errorToast && <div className="alert-toast toast-error"><span>⚠️ {errorToast}</span></div>}

      <header className="mb-6">
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>Admin Control Center</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Manage store properties, normal users, administrators, and track overall application statistics.</p>
      </header>

      {/* Stats Widgets */}
      <section className="dashboard-grid">
        <div className="glass-panel stat-card">
          <div className="stat-icon"><Users size={28} /></div>
          <div className="stat-info">
            <span className="stat-value">{statsLoading ? '...' : stats.totalUsers}</span>
            <span className="stat-label">Total Users</span>
          </div>
        </div>
        
        <div className="glass-panel stat-card">
          <div className="stat-icon"><Store size={28} /></div>
          <div className="stat-info">
            <span className="stat-value">{statsLoading ? '...' : stats.totalStores}</span>
            <span className="stat-label">Registered Stores</span>
          </div>
        </div>

        <div className="glass-panel stat-card">
          <div className="stat-icon" style={{ color: 'var(--color-warning)', background: 'rgba(245,158,11,0.15)' }}><Star size={28} /></div>
          <div className="stat-info">
            <span className="stat-value">{statsLoading ? '...' : stats.totalRatings}</span>
            <span className="stat-label">Submitted Ratings</span>
          </div>
        </div>
      </section>

      {/* Main Split Layout */}
      <div className="section-split mb-6">
        
        {/* Left Side: Listings of Users and Stores */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* User Listings */}
          <div className="glass-panel panel">
            <div className="panel-header">
              <h3 className="panel-title"><Users size={20} /> Users List</h3>
              <select 
                className="form-control" 
                style={{ width: 'auto', padding: '0.4rem 1.5rem 0.4rem 0.5rem', fontSize: '0.85rem' }}
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
              >
                <option value="">All Roles</option>
                <option value="user">Normal Users</option>
                <option value="admin">System Admins</option>
              </select>
            </div>

            <div className="filter-bar">
              <div className="search-input-wrapper">
                <Search size={16} className="search-icon" />
                <input 
                  type="text" 
                  className="form-control search-input" 
                  placeholder="Filter users by Name, Email, Address..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="table-responsive">
              {usersLoading ? (
                <div className="text-center p-4"><Loader2 className="animate-spin" style={{ margin: 'auto', animation: 'spin 1s linear infinite' }} /></div>
              ) : users.length === 0 ? (
                <div className="text-center p-4" style={{ color: 'var(--text-secondary)' }}>No matching users found.</div>
              ) : (
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th className="sortable" onClick={() => handleUserSort('name')}>
                        <div className="th-content">Name {renderSortIcon('user', 'name')}</div>
                      </th>
                      <th className="sortable" onClick={() => handleUserSort('email')}>
                        <div className="th-content">Email {renderSortIcon('user', 'email')}</div>
                      </th>
                      <th className="sortable" onClick={() => handleUserSort('address')}>
                        <div className="th-content">Address {renderSortIcon('user', 'address')}</div>
                      </th>
                      <th className="sortable" onClick={() => handleUserSort('role')}>
                        <div className="th-content">Role {renderSortIcon('user', 'role')}</div>
                      </th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id}>
                        <td style={{ fontWeight: 600 }}>{u.name}</td>
                        <td>{u.email}</td>
                        <td style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={u.address}>
                          {u.address}
                        </td>
                        <td>
                          <span className={`badge badge-${u.role}`}>
                            {u.role === 'admin' ? 'Admin' : 'Normal User'}
                          </span>
                        </td>
                        <td>
                          <button className="btn-icon" onClick={() => handleViewDetails(u.id)} title="View User Details">
                            <Eye size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Stores Listings */}
          <div className="glass-panel panel">
            <div className="panel-header">
              <h3 className="panel-title"><Store size={20} /> Registered Stores</h3>
            </div>

            <div className="filter-bar">
              <div className="search-input-wrapper">
                <Search size={16} className="search-icon" />
                <input 
                  type="text" 
                  className="form-control search-input" 
                  placeholder="Search stores by Name, Email, Address..."
                  value={storeSearch}
                  onChange={(e) => setStoreSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="table-responsive">
              {storesLoading ? (
                <div className="text-center p-4"><Loader2 className="animate-spin" style={{ margin: 'auto', animation: 'spin 1s linear infinite' }} /></div>
              ) : stores.length === 0 ? (
                <div className="text-center p-4" style={{ color: 'var(--text-secondary)' }}>No stores registered.</div>
              ) : (
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th className="sortable" onClick={() => handleStoreSort('name')}>
                        <div className="th-content">Store Name {renderSortIcon('store', 'name')}</div>
                      </th>
                      <th className="sortable" onClick={() => handleStoreSort('email')}>
                        <div className="th-content">Owner Email {renderSortIcon('store', 'email')}</div>
                      </th>
                      <th className="sortable" onClick={() => handleStoreSort('address')}>
                        <div className="th-content">Store Address {renderSortIcon('store', 'address')}</div>
                      </th>
                      <th className="sortable" onClick={() => handleStoreSort('rating')}>
                        <div className="th-content">Avg Rating {renderSortIcon('store', 'rating')}</div>
                      </th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stores.map(s => (
                      <tr key={s.id}>
                        <td style={{ fontWeight: 600 }}>{s.name}</td>
                        <td>{s.email}</td>
                        <td style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={s.address}>
                          {s.address}
                        </td>
                        <td>
                          <span className="rating-badge">
                            <Star size={14} fill="currentColor" />
                            {s.rating > 0 ? s.rating.toFixed(1) : 'Unrated'}
                          </span>
                        </td>
                        <td>
                          <button className="btn-icon" onClick={() => handleViewDetails(s.id)} title="View Store Details">
                            <Eye size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

        </div>

        {/* Right Side: Add New User Form */}
        <div>
          <div className="glass-panel panel" style={{ position: 'sticky', top: '100px' }}>
            <div className="panel-header" style={{ marginBottom: '1.25rem' }}>
              <h3 className="panel-title"><UserPlus size={20} /> Register New User / Store</h3>
            </div>
            
            <form onSubmit={handleAddUser}>
              
              <div className="form-group">
                <label className="form-label">Role</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                  <button
                    type="button"
                    className={`btn ${formRole === 'user' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setFormRole('user')}
                    style={{ padding: '0.5rem' }}
                  >
                    User
                  </button>
                  <button
                    type="button"
                    className={`btn ${formRole === 'store_owner' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setFormRole('store_owner')}
                    style={{ padding: '0.5rem' }}
                  >
                    Store
                  </button>
                  <button
                    type="button"
                    className={`btn ${formRole === 'admin' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setFormRole('admin')}
                    style={{ padding: '0.5rem' }}
                  >
                    Admin
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="newName">{formRole === 'store_owner' ? 'Store Name' : 'Full Name'}</label>
                <input
                  id="newName"
                  type="text"
                  className="form-control"
                  placeholder="e.g. Store Owner Account Name"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                />
                {formName.length > 0 && (
                  <div className="form-helper">
                    <span style={{ color: formName.length < 20 ? 'var(--color-danger)' : 'var(--color-success)' }}>
                      Min 20 characters
                    </span>
                    <span>{formName.length}/60</span>
                  </div>
                )}
                {formErrors.name && <span className="form-error">{formErrors.name}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="newEmail">Email Address</label>
                <input
                  id="newEmail"
                  type="email"
                  className="form-control"
                  placeholder="email@example.com"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                />
                {formErrors.email && <span className="form-error">{formErrors.email}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="newAddress">{formRole === 'store_owner' ? 'Store Address' : 'User Address'}</label>
                <textarea
                  id="newAddress"
                  className="form-control"
                  placeholder="Enter complete physical address details..."
                  rows={2}
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  style={{ resize: 'vertical' }}
                />
                <div className="form-helper">
                  <span>Max 400 characters</span>
                  <span>{formAddress.length}/400</span>
                </div>
                {formErrors.address && <span className="form-error">{formErrors.address}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="newPassword">Initial Password</label>
                <input
                  id="newPassword"
                  type="text"
                  className="form-control"
                  placeholder="Choose credentials"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                />
                <div className="form-helper" style={{ fontSize: '0.75rem', flexDirection: 'column', gap: '2px', alignItems: 'flex-start' }}>
                  <span>• Length 8-16 characters</span>
                  <span>• 1+ uppercase letter</span>
                  <span>• 1+ special character</span>
                </div>
                {formErrors.password && <span className="form-error">{formErrors.password}</span>}
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.75rem' }} disabled={submitLoading}>
                {submitLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={16} style={{ animation: 'spin 1s linear infinite' }} />
                    Creating User...
                  </>
                ) : (
                  <>
                    <UserPlus size={16} />
                    Register Account
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

      </div>

      {/* User Details Modal Popup */}
      {selectedUser && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content">
            <button className="modal-close-btn" onClick={() => setSelectedUser(null)}>
              <X size={20} />
            </button>
            <h3 className="modal-title">Inspect Profile</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div className="detail-row">
                <span className="detail-label">Name</span>
                <span className="detail-val" style={{ fontWeight: 600 }}>{selectedUser.name}</span>
              </div>
              
              <div className="detail-row">
                <span className="detail-label">Email Address</span>
                <span className="detail-val">{selectedUser.email}</span>
              </div>

              <div className="detail-row">
                <span className="detail-label">Mailing Address</span>
                <span className="detail-val">{selectedUser.address}</span>
              </div>

              <div className="detail-row">
                <span className="detail-label">System Role</span>
                <span className="detail-val">
                  <span className={`badge badge-${selectedUser.role}`} style={{ fontSize: '0.85rem' }}>
                    {selectedUser.role === 'admin' ? 'Administrator' : selectedUser.role === 'store_owner' ? 'Store Owner' : 'Normal User'}
                  </span>
                </span>
              </div>

              {selectedUser.role === 'store_owner' && (
                <div className="detail-row" style={{ background: 'rgba(245, 158, 11, 0.05)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.15)' }}>
                  <span className="detail-label" style={{ color: 'var(--color-warning)' }}>Overall Store Rating</span>
                  <div className="d-flex align-center gap-2 mt-4">
                    <span className="rating-number-lg" style={{ fontSize: '2.5rem' }}>{selectedUser.rating > 0 ? selectedUser.rating.toFixed(2) : '0.00'}</span>
                    <div>
                      <div className="stars-display" style={{ fontSize: '1.25rem' }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star} 
                            size={18} 
                            fill={star <= Math.round(selectedUser.rating) ? 'currentColor' : 'transparent'} 
                          />
                        ))}
                      </div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Computed Average Rating</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <button className="btn btn-secondary mt-4" style={{ width: '100%' }} onClick={() => setSelectedUser(null)}>
              Close Inspector
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default AdminDashboard;
