import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'content_creator' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(form.name, form.email, form.password, form.role);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">
          <span>📱</span>
          <h2>Content Platform</h2>
        </div>
        <h1>Create account</h1>
        <p className="subtitle">Register to start managing social media content</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input id="name" name="name" value={form.name} onChange={handleChange} placeholder="John Doe" required />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" value={form.password} onChange={handleChange} placeholder="Min. 8 characters" required minLength={8} />
          </div>
          <div className="form-group">
            <label htmlFor="role">Role</label>
            <select id="role" name="role" value={form.role} onChange={handleChange}>
              <option value="content_creator">Content Creator</option>
              <option value="reviewer">Reviewer</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="auth-link">
          Already have an account? <Link to="/login">Sign in here</Link>
        </p>
      </div>
    </div>
  );
}
