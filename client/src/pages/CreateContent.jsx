import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { contentAPI } from '../services/api';

const PLATFORMS = ['instagram', 'facebook', 'twitter', 'linkedin', 'tiktok', 'youtube'];

export default function CreateContent() {
  const [form, setForm] = useState({
    title: '',
    caption: '',
    media_url: '',
    platform: 'instagram',
    hashtags: '',
    status: 'draft',
    scheduled_at: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = { ...form };
      if (!payload.media_url) delete payload.media_url;
      if (!payload.hashtags) delete payload.hashtags;
      if (!payload.scheduled_at) delete payload.scheduled_at;

      const response = await contentAPI.create(payload);
      navigate(`/content/${response.data.content.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Create Content</h1>
          <p>Create new social media content</p>
        </div>
      </div>

      <div className="page-body">
        <div className="card" style={{ maxWidth: 800 }}>
          <div className="card-body">
            {error && <div className="alert alert-error">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="title">Title *</label>
                <input id="title" name="title" value={form.title} onChange={handleChange} placeholder="Content title" required />
              </div>

              <div className="form-group">
                <label htmlFor="caption">Caption *</label>
                <textarea id="caption" name="caption" value={form.caption} onChange={handleChange} placeholder="Write your caption..." required />
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
                <input id="media_url" name="media_url" value={form.media_url} onChange={handleChange} placeholder="https://example.com/image.jpg" />
              </div>

              <div className="form-group">
                <label htmlFor="hashtags">Hashtags</label>
                <input id="hashtags" name="hashtags" value={form.hashtags} onChange={handleChange} placeholder="#marketing #socialmedia" />
              </div>

              <div className="form-group">
                <label htmlFor="scheduled_at">Scheduled Date/Time</label>
                <input id="scheduled_at" name="scheduled_at" type="datetime-local" value={form.scheduled_at} onChange={handleChange} />
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Content'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => navigate('/content')}>
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
