import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
// ❌ REMOVE THIS LINE (line 3):
// <Link to="/orders" style={styles.navLink}>
//   My Orders
// </Link>

function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    loadUserAndCart();
    
    window.addEventListener('cartUpdated', loadUserAndCart);
    return () => window.removeEventListener('cartUpdated', loadUserAndCart);
  }, []);

  const loadUserAndCart = () => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartCount(cart.reduce((sum, item) => sum + item.quantity, 0));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('cart');
    alert('Logged out successfully!');
    navigate('/login');
    window.location.reload();
  };

  return (
    <nav style={styles.navbar}>
      <div style={styles.navContainer}>
        {/* ✅ Mountain Logo & Brand */}
        <div style={styles.brand} onClick={() => navigate('/')}>
          <img 
            src="/assets/logo.jpg" 
            alt="EverestMart" 
            style={styles.navLogo}
          />
          <span style={styles.brandName}>EverestMart</span>
        </div>

        {/* Navigation Links */}
        <div style={styles.navLinks}>
          <button style={styles.navBtn} onClick={() => navigate('/')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={styles.icon}>
              <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Home
          </button>
          
          <button style={styles.navBtn} onClick={() => navigate('/cart')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={styles.icon}>
              <path d="M9 2C7.89543 2 7 2.89543 7 4V6H5C3.89543 6 3 6.89543 3 8V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V8C21 6.89543 20.1046 6 19 6H17V4C17 2.89543 16.1046 2 15 2H9ZM9 4H15V6H9V4ZM5 8H19V19H5V8Z" fill="currentColor"/>
            </svg>
            Cart
            {cartCount > 0 && (
              <span style={styles.badge}>{cartCount}</span>
            )}
          </button>

          {user ? (
            <>
              {/* ✅ Orders Button - Already correct! */}
              <button style={styles.navBtn} onClick={() => navigate('/orders')}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={styles.icon}>
                  <path d="M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z" stroke="currentColor" strokeWidth="2"/>
                  <path d="M16 7V5C16 4.46957 15.7893 3.96086 15.4142 3.58579C15.0391 3.21071 14.5304 3 14 3H10C9.46957 3 8.96086 3.21071 8.58579 3.58579C8.21071 3.96086 8 4.46957 8 5V7" stroke="currentColor" strokeWidth="2"/>
                </svg>
                Orders
              </button>
              
              <div style={styles.userSection}>
                {user.avatar && (
                  <img 
                    src={user.avatar} 
                    alt={user.name}
                    style={styles.userAvatar}
                  />
                )}
                <span style={styles.userName}>{user.name}</span>
                <button style={styles.logoutBtn} onClick={handleLogout}>
                  Logout
                </button>
              </div>
            </>
          ) : (
            <button 
              style={styles.loginBtn} 
              onClick={() => navigate('/login')}
            >
              Login
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

const styles = {
  navbar: {
    background: '#FFFFFF',
    borderBottom: '1px solid #E8ECEF',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    padding: '1rem 0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
  },
  navContainer: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '0 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    cursor: 'pointer',
    transition: 'opacity 0.2s'
  },
  navLogo: {
    width: '45px',
    height: 'auto',
    display: 'block'
  },
  brandName: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#2C3E50',
    letterSpacing: '-0.5px'
  },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  navBtn: {
    padding: '0.6rem 1rem',
    background: 'transparent',
    border: 'none',
    borderRadius: '6px',
    fontWeight: '600',
    fontSize: '0.95rem',
    cursor: 'pointer',
    transition: 'background 0.2s',
    color: '#2C3E50',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    position: 'relative'
  },
  icon: {
    flexShrink: 0
  },
  badge: {
    position: 'absolute',
    top: '2px',
    right: '2px',
    background: '#E74C3C',
    color: 'white',
    borderRadius: '10px',
    padding: '0.15rem 0.4rem',
    fontSize: '0.7rem',
    fontWeight: '700',
    minWidth: '18px',
    textAlign: 'center'
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginLeft: '0.5rem',
    paddingLeft: '1rem',
    borderLeft: '1px solid #E8ECEF'
  },
  userName: {
    fontWeight: '600',
    color: '#2C3E50',
    fontSize: '0.95rem'
  },
  userAvatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    border: '2px solid #E8ECEF'
  },
  loginBtn: {
    padding: '0.6rem 1.5rem',
    background: '#2C3E50',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontWeight: '600',
    fontSize: '0.95rem',
    cursor: 'pointer',
    transition: 'background 0.2s'
  },
  logoutBtn: {
    padding: '0.5rem 1rem',
    background: 'transparent',
    color: '#E74C3C',
    border: '1px solid #E74C3C',
    borderRadius: '6px',
    fontWeight: '600',
    fontSize: '0.875rem',
    cursor: 'pointer',
    transition: 'all 0.2s'
  }
};

export default Navbar;
