import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { contentAPI, reviewAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';

export default function ContentDetail() {
  const { id } = useParams();
  const [content, setContent] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const { isAdmin, isCreator } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadContent();
  }, [id]);

  const loadContent = async () => {
    try {
      const [contentRes, reviewsRes] = await Promise.all([
        contentAPI.getById(id),
        reviewAPI.getByContent(id).catch(() => ({ data: { reviews: [] } })),
      ]);
      setContent(contentRes.data.content);
      setReviews(reviewsRes.data.reviews);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitForReview = async () => {
    setActionLoading(true);
    try {
      await contentAPI.submit(id);
      loadContent();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSchedule = async () => {
    if (!scheduleDate) return;
    setActionLoading(true);
    try {
      const formatted = scheduleDate.replace('T', ' ') + ':00';
      await contentAPI.schedule(id, { scheduled_at: formatted });
      setShowScheduleModal(false);
      loadContent();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!window.confirm('Publish this content now?')) return;
    setActionLoading(true);
    try {
      await contentAPI.publish(id);
      loadContent();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this content?')) return;
    try {
      await contentAPI.delete(id);
      navigate('/content');
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  if (error || !content) {
    return <div className="page-body"><div className="alert alert-error">{error || 'Content not found'}</div></div>;
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1>{content.title}</h1>
          <p>Content Details</p>
        </div>
        <StatusBadge status={content.status} />
      </div>

      <div className="page-body">
        <div className="detail-grid">
          <div className="card">
            <div className="card-body">
              <div className="detail-field">
                <label>Caption</label>
                <p>{content.caption}</p>
              </div>
              <div className="form-row">
                <div className="detail-field">
                  <label>Platform</label>
                  <p style={{ textTransform: 'capitalize' }}>{content.platform}</p>
                </div>
                <div className="detail-field">
                  <label>Hashtags</label>
                  <p>{content.hashtags || 'None'}</p>
                </div>
              </div>
              {content.media_url && (
                <div className="detail-field">
                  <label>Media URL</label>
                  <p><a href={content.media_url} target="_blank" rel="noreferrer">{content.media_url}</a></p>
                </div>
              )}
              {content.scheduled_at && (
                <div className="detail-field">
                  <label>Scheduled At</label>
                  <p>{new Date(content.scheduled_at).toLocaleString()}</p>
                </div>
              )}

              <div className="detail-actions">
                {(isCreator() || isAdmin()) && content.status === 'draft' && (
                  <button className="btn btn-primary" onClick={handleSubmitForReview} disabled={actionLoading}>
                    Submit for Review
                  </button>
                )}
                {(isCreator() || isAdmin()) && content.status === 'approved' && (
                  <button className="btn btn-warning" onClick={() => setShowScheduleModal(true)} disabled={actionLoading}>
                    Schedule
                  </button>
                )}
                {isAdmin() && content.status === 'scheduled' && (
                  <button className="btn btn-success" onClick={handlePublish} disabled={actionLoading}>
                    Publish Now
                  </button>
                )}
                {(isCreator() || isAdmin()) && (
                  <>
                    <Link to={`/content/${id}/edit`} className="btn btn-secondary">Edit</Link>
                    <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
                  </>
                )}
              </div>
            </div>
          </div>

          <div>
            <div className="card" style={{ marginBottom: 24 }}>
              <div className="card-header"><h3>Metadata</h3></div>
              <div className="card-body">
                <div className="detail-field">
                  <label>Content ID</label>
                  <p>#{content.id}</p>
                </div>
                <div className="detail-field">
                  <label>Created By</label>
                  <p>{content.creator_name}</p>
                </div>
                <div className="detail-field">
                  <label>Created</label>
                  <p>{new Date(content.created_at).toLocaleString()}</p>
                </div>
                <div className="detail-field">
                  <label>Last Updated</label>
                  <p>{new Date(content.updated_at).toLocaleString()}</p>
                </div>
              </div>
            </div>

            {reviews.length > 0 && (
              <div className="card">
                <div className="card-header"><h3>Review History</h3></div>
                <div className="card-body">
                  {reviews.map((review) => (
                    <div key={review.id} className="review-item">
                      <div className="review-header">
                        <span className="reviewer">{review.reviewer_name}</span>
                        <StatusBadge status={review.status} />
                      </div>
                      {review.comments && <p>{review.comments}</p>}
                      <small style={{ color: 'var(--gray-500)' }}>
                        {new Date(review.reviewed_at).toLocaleString()}
                      </small>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showScheduleModal && (
        <div className="modal-overlay" onClick={() => setShowScheduleModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Schedule Content</h3>
            <div className="form-group">
              <label>Scheduled Date/Time</label>
              <input
                type="datetime-local"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
              />
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowScheduleModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSchedule} disabled={actionLoading || !scheduleDate}>
                {actionLoading ? 'Scheduling...' : 'Schedule'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
