import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { reviewAPI } from '../services/api';
import StatusBadge from '../components/StatusBadge';

export default function ReviewPage() {
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedContent, setSelectedContent] = useState(null);
  const [comments, setComments] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadPending();
  }, []);

  const loadPending = async () => {
    try {
      const response = await reviewAPI.getPending();
      setContents(response.data.contents);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (contentId) => {
    setActionLoading(true);
    try {
      await reviewAPI.approve(contentId, { comments });
      setSelectedContent(null);
      setComments('');
      loadPending();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (contentId) => {
    if (!comments.trim()) {
      alert('Please provide rejection comments.');
      return;
    }
    setActionLoading(true);
    try {
      await reviewAPI.reject(contentId, { comments });
      setSelectedContent(null);
      setComments('');
      loadPending();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Content Reviews</h1>
          <p>Review and approve pending content submissions</p>
        </div>
      </div>

      <div className="page-body">
        {error && <div className="alert alert-error">{error}</div>}

        {loading ? (
          <div className="loading"><div className="spinner"></div></div>
        ) : contents.length > 0 ? (
          <div className="card">
            <div className="card-body">
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Platform</th>
                      <th>Creator</th>
                      <th>Submitted</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contents.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <Link to={`/content/${item.id}`}>{item.title}</Link>
                        </td>
                        <td style={{ textTransform: 'capitalize' }}>{item.platform}</td>
                        <td>{item.creator_name}</td>
                        <td>{new Date(item.updated_at).toLocaleDateString()}</td>
                        <td>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => { setSelectedContent(item); setComments(''); }}
                          >
                            Review
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="card">
            <div className="empty-state">
              <h3>No pending reviews</h3>
              <p>All content has been reviewed. Check back later for new submissions.</p>
            </div>
          </div>
        )}
      </div>

      {selectedContent && (
        <div className="modal-overlay" onClick={() => setSelectedContent(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 600 }}>
            <h3>Review: {selectedContent.title}</h3>
            <StatusBadge status={selectedContent.status} />
            <div className="detail-field" style={{ marginTop: 16 }}>
              <label>Caption</label>
              <p>{selectedContent.caption}</p>
            </div>
            <div className="form-row">
              <div className="detail-field">
                <label>Platform</label>
                <p style={{ textTransform: 'capitalize' }}>{selectedContent.platform}</p>
              </div>
              <div className="detail-field">
                <label>Creator</label>
                <p>{selectedContent.creator_name}</p>
              </div>
            </div>
            <div className="form-group" style={{ marginTop: 16 }}>
              <label>Comments</label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Add review comments (required for rejection)..."
              />
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setSelectedContent(null)}>Cancel</button>
              <button
                className="btn btn-danger"
                onClick={() => handleReject(selectedContent.id)}
                disabled={actionLoading}
              >
                Reject
              </button>
              <button
                className="btn btn-success"
                onClick={() => handleApprove(selectedContent.id)}
                disabled={actionLoading}
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
