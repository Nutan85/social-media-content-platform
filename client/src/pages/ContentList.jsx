import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { contentAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';

const PLATFORMS = ['instagram', 'facebook', 'twitter', 'linkedin', 'tiktok', 'youtube'];
const STATUSES = ['draft', 'pending_review', 'approved', 'rejected', 'scheduled', 'published'];

export default function ContentList() {
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ search: '', platform: '', status: '' });
  const { isAdmin, isCreator } = useAuth();

  useEffect(() => {
    loadContent();
  }, [filters]);

  const loadContent = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.platform) params.platform = filters.platform;
      if (filters.status) params.status = filters.status;

      const response = await contentAPI.getAll(params);
      setContents(response.data.contents);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this content?')) return;
    try {
      await contentAPI.delete(id);
      loadContent();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Content Library</h1>
          <p>Manage all your social media content</p>
        </div>
        {(isAdmin() || isCreator()) && (
          <Link to="/content/create" className="btn btn-primary">+ Create Content</Link>
        )}
      </div>

      <div className="page-body">
        <div className="filters-bar">
          <input
            type="text"
            placeholder="Search content..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
          <select value={filters.platform} onChange={(e) => setFilters({ ...filters, platform: e.target.value })}>
            <option value="">All Platforms</option>
            {PLATFORMS.map((p) => (
              <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
            ))}
          </select>
          <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
            <option value="">All Statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s.replace('_', ' ')}</option>
            ))}
          </select>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="card">
          <div className="card-body">
            {loading ? (
              <div className="loading"><div className="spinner"></div></div>
            ) : contents.length > 0 ? (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Platform</th>
                      <th>Status</th>
                      <th>Creator</th>
                      <th>Updated</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contents.map((item) => (
                      <tr key={item.id}>
                        <td><Link to={`/content/${item.id}`}>{item.title}</Link></td>
                        <td style={{ textTransform: 'capitalize' }}>{item.platform}</td>
                        <td><StatusBadge status={item.status} /></td>
                        <td>{item.creator_name}</td>
                        <td>{new Date(item.updated_at).toLocaleDateString()}</td>
                        <td>
                          <div className="actions-cell">
                            <Link to={`/content/${item.id}/edit`} className="btn btn-secondary btn-sm">Edit</Link>
                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item.id)}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <h3>No content found</h3>
                <p>Create your first social media content to get started.</p>
                <Link to="/content/create" className="btn btn-primary" style={{ marginTop: 16 }}>Create Content</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
