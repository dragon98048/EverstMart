import { useState } from 'react';
import axios from 'axios';

function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await axios.post('http://localhost:5000/api/auth/admin/login', {
        email,
        password
      });

      if (data.success) {
        // Store token and user info
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        console.log('✅ Admin login successful:', data.user);
        
        // Redirect to admin dashboard
        window.location.href = '/admin/dashboard';
      }
    } catch (error) {
      console.error('❌ Login failed:', error);
      
      const errorMsg = error.response?.data?.message || 'Login failed';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>👨‍💼 Admin Login</h1>
        
        {error && (
          <div style={styles.errorBox}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
              placeholder="admin@myshop.com"
            />
          </div>
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.input}
              placeholder="Enter admin password"
            />
          </div>
          
          <button 
            type="submit" 
            style={styles.button}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login as Admin'}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: '#F8F7F5',
    padding: '2rem'
  },
  card: {
    background: '#FFFFFF',
    padding: '2rem',
    maxWidth: '400px',
    width: '100%',
    border: '1px solid #E5E2DD'
  },
  title: {
    fontSize: '1.875rem',
    fontWeight: '300',
    color: '#1A1A1A',
    marginBottom: '2rem',
    textAlign: 'center',
    letterSpacing: '0.5px'
  },
  errorBox: {
    padding: '1rem',
    background: '#FEE2E2',
    border: '1px solid #EF4444',
    color: '#991B1B',
    marginBottom: '1.5rem',
    fontSize: '0.875rem'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  label: {
    fontSize: '0.875rem',
    color: '#5A5A5A',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  input: {
    padding: '0.75rem',
    border: '1px solid #E5E2DD',
    fontSize: '0.9375rem',
    outline: 'none'
  },
  button: {
    padding: '1rem',
    background: '#1A1A1A',
    color: '#FFFFFF',
    border: 'none',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  }
};

export default AdminLogin;
