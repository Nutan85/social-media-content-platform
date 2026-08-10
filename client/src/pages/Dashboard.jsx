import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { dashboardAPI } from '../services/api';
import StatusBadge from '../components/StatusBadge';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6'];

const STAT_CONFIG = [
  { key: 'total', label: 'Total Content', icon: '📊', className: 'total' },
  { key: 'draft', label: 'Draft', icon: '📝', className: 'draft' },
  { key: 'pending_review', label: 'Pending Review', icon: '⏳', className: 'pending' },
  { key: 'approved', label: 'Approved', icon: '✅', className: 'approved' },
  { key: 'scheduled', label: 'Scheduled', icon: '📅', className: 'scheduled' },
  { key: 'published', label: 'Published', icon: '🚀', className: 'published' },
  { key: 'rejected', label: 'Rejected', icon: '❌', className: 'rejected' },
];

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await dashboardAPI.getStats();
      setData(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-body">
        <div className="alert alert-error">{error}</div>
      </div>
    );
  }

  const { stats, platformStats, recentContent } = data;
  const statusChartData = [
    { name: 'Draft', value: stats.draft },
    { name: 'Pending', value: stats.pending_review },
    { name: 'Approved', value: stats.approved },
    { name: 'Scheduled', value: stats.scheduled },
    { name: 'Published', value: stats.published },
    { name: 'Rejected', value: stats.rejected },
  ].filter((d) => d.value > 0);

  const platformChartData = platformStats.map((p) => ({
    name: p.platform.charAt(0).toUpperCase() + p.platform.slice(1),
    count: Number(p.count),
  }));

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Overview of your social media content</p>
        </div>
      </div>

      <div className="page-body">
        <div className="stats-grid">
          {STAT_CONFIG.map((stat) => (
            <div key={stat.key} className={`stat-card ${stat.className}`}>
              <div className="stat-icon">{stat.icon}</div>
              <div className="stat-value">{stats[stat.key]}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="charts-grid">
          <div className="chart-card">
            <h3>Content by Status</h3>
            {statusChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusChartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {statusChartData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state"><p>No content data available</p></div>
            )}
          </div>

          <div className="chart-card">
            <h3>Content by Platform</h3>
            {platformChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={platformChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state"><p>No platform data available</p></div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Recent Content</h3>
            <Link to="/content" className="btn btn-secondary btn-sm">View All</Link>
          </div>
          <div className="card-body">
            {recentContent.length > 0 ? (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Platform</th>
                      <th>Status</th>
                      <th>Creator</th>
                      <th>Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentContent.map((item) => (
                      <tr key={item.id}>
                        <td><Link to={`/content/${item.id}`}>{item.title}</Link></td>
                        <td style={{ textTransform: 'capitalize' }}>{item.platform}</td>
                        <td><StatusBadge status={item.status} /></td>
                        <td>{item.creator_name}</td>
                        <td>{new Date(item.updated_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state"><p>No recent content</p></div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
