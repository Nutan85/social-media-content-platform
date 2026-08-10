import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { contentAPI } from '../services/api';

const PLATFORMS = ['instagram', 'facebook', 'twitter', 'linkedin', 'tiktok', 'youtube'];

export default function EditContent() {
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadContent();
  }, [id]);

  const loadContent = async () => {
    try {
      const response = await contentAPI.getById(id);
      const c = response.data.content;
      setForm({
        title: c.title,
        caption: c.caption,
        media_url: c.media_url || '',
        platform: c.platform,
        hashtags: c.hashtags || '',
        status: c.status,
        scheduled_at: c.scheduled_at ? c.scheduled_at.replace(' ', 'T').slice(0, 16) : '',
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const payload = { ...form };
      if (!payload.media_url) payload.media_url = null;
      if (!payload.hashtags) payload.hashtags = null;
      if (!payload.scheduled_at) payload.scheduled_at = null;
      else payload.scheduled_at = payload.scheduled_at.replace('T', ' ') + ':00';

      await contentAPI.update(id, payload);
      navigate(`/content/${id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  if (!form) {
    return <div className="page-body"><div className="alert alert-error">{error || 'Content not found'}</div></div>;
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Edit Content</h1>
          <p>Update social media content</p>
        </div>
      </div>

      <div className="page-body">
        <div className="card" style={{ maxWidth: 800 }}>
          <div className="card-body">
            {error && <div className="alert alert-error">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="title">Title *</label>
                <input id="title" name="title" value={form.title} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label htmlFor="caption">Caption *</label>
                <textarea id="caption" name="caption" value={form.caption} onChange={handleChange} required />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="platform">Platform *</label>
                  <select id="platform" name="platform" value={form.platform} onChange={handleChange}>
                    {PLATFORMS.map((p) => (
                      <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="status">Status</label>
                  <select id="status" name="status" value={form.status} onChange={handleChange}>
                    <option value="draft">Draft</option>
                    <option value="pending_review">Pending Review</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="media_url">Media URL</label>
                <input id="media_url" name="media_url" value={form.media_url} onChange={handleChange} />
              </div>

              <div className="form-group">
                <label htmlFor="hashtags">Hashtags</label>
                <input id="hashtags" name="hashtags" value={form.hashtags} onChange={handleChange} />
              </div>

              <div className="form-group">
                <label htmlFor="scheduled_at">Scheduled Date/Time</label>
                <input id="scheduled_at" name="scheduled_at" type="datetime-local" value={form.scheduled_at} onChange={handleChange} />
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => navigate(`/content/${id}`)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
