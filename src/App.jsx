import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailure from './pages/PaymentFailure';
import OrderHistory from './pages/OrderHistory'; // ✅ Add this
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/admin/AdminDashboard';
import RiderDashboard from './pages/rider/RiderDashboard';
import RiderLogin from './pages/rider/RiderLogin';
import RiderRegister from './pages/rider/RiderRegister';
import AddressBook from './pages/AddressBook';
function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  return (
    <Router>
      <div style={{ minHeight: '100vh', background: '#FFFFFF' }}>
        <Navbar user={user} setUser={setUser} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-failure" element={<PaymentFailure />} />
          
          {/* ✅ Add both /orders and /my-orders routes */}
          <Route path="/orders" element={<OrderHistory />} />
          <Route path="/my-orders" element={<OrderHistory />} />
          
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/register" element={<Register />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          
          {/* Rider Routes */}
          <Route path="/rider/login" element={<RiderLogin />} />
          <Route path="/rider/register" element={<RiderRegister />} />
          <Route path="/rider/dashboard" element={<RiderDashboard />} />
          {/* Address Book */}
          <Route path="/addresses" element={<AddressBook />} /> 
          {/* 404 Page */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

// ✅ Add 404 Page Component
function NotFound() {
  return (
    <div style={{
      minHeight: '60vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '2rem'
    }}>
      <h1 style={{ fontSize: '4rem', margin: 0 }}>404</h1>
      <p style={{ fontSize: '1.5rem', color: '#8B8B8B' }}>Page not found</p>
      <a href="/" style={{
        marginTop: '2rem',
        padding: '1rem 2rem',
        background: '#1A1A1A',
        color: '#FFFFFF',
        textDecoration: 'none',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        fontSize: '0.875rem'
      }}>
        Go Home
      </a>
    </div>
  );
}

export default App;
