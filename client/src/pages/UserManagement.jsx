import { useState, useEffect } from 'react';
import { userAPI } from '../services/api';

const ROLES = ['admin', 'content_creator', 'reviewer'];

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', role: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await userAPI.getAll();
      setUsers(response.data.users);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setEditForm({ name: user.name, email: user.email, role: user.role });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await userAPI.update(editingUser.id, editForm);
      setEditingUser(null);
      loadUsers();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await userAPI.delete(id);
      loadUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1>User Management</h1>
          <p>Manage platform users and roles</p>
        </div>
      </div>

      <div className="page-body">
        {error && <div className="alert alert-error">{error}</div>}

        <div className="card">
          <div className="card-body">
            {loading ? (
              <div className="loading"><div className="spinner"></div></div>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>
                          <span className={`badge badge-${user.role}`}>
                            {user.role.replace('_', ' ')}
                          </span>
                        </td>
                        <td>{new Date(user.created_at).toLocaleDateString()}</td>
                        <td>
                          <div className="actions-cell">
                            <button className="btn btn-secondary btn-sm" onClick={() => handleEdit(user)}>
                              Edit
                            </button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(user.id)}>
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {editingUser && (
        <div className="modal-overlay" onClick={() => setEditingUser(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Edit User</h3>
            <div className="form-group">
              <label>Name</label>
              <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Role</label>
              <select value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}>
                {ROLES.map((r) => (
                  <option key={r} value={r}>{r.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setEditingUser(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
