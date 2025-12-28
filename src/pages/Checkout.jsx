import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';


function Checkout() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [addresses, setAddresses] = useState([]);
const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    pincode: '',
    paymentMethod: 'cod'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (cart.length === 0) {
      navigate('/cart');
    }
    setCartItems(cart);

    // Load user data if logged in
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.name) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      }));
    }
  }, [navigate]);
useEffect(() => {
  loadSavedAddresses();
}, []);

const loadSavedAddresses = async () => {
  try {
    const token = localStorage.getItem('token');
    const { data } = await axios.get('http://localhost:5000/api/addresses', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    setAddresses(data.addresses);
    
    // Auto-select default address
    const defaultAddr = data.addresses.find(addr => addr.isDefault);
    if (defaultAddr) {
      setSelectedAddressId(defaultAddr._id);
    }
  } catch (error) {
    console.error('Failed to load addresses');
  }
};
<div>
  <h3>Select Delivery Address</h3>
  {addresses.map(address => (
    <div 
      key={address._id}
      onClick={() => setSelectedAddressId(address._id)}
      style={{
        border: selectedAddressId === address._id ? '2px solid #1A1A1A' : '1px solid #E5E2DD',
        padding: '1rem',
        marginBottom: '1rem',
        cursor: 'pointer'
      }}
    >
      <strong>{address.label}</strong> {address.isDefault && '(Default)'}
      <p>{address.fullName} - {address.phone}</p>
      <p>{address.addressLine1}, {address.city}</p>
    </div>
  ))}
  
  <button onClick={() => navigate('/addresses')}>
    + Add New Address
  </button>
</div>


  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderData = {
        ...formData,
        items: cartItems,
        totalAmount: getTotalPrice(),
        orderDate: new Date().toISOString()
      };

      // For now, just simulate order placement
      console.log('Order Data:', orderData);

      // Clear cart
      localStorage.setItem('cart', JSON.stringify([]));
      window.dispatchEvent(new Event('cartUpdated'));

      // Show success message
      alert('Order placed successfully! 🎉');
      
      // Redirect to home
      navigate('/');
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h1 style={styles.title}>Checkout</h1>

        <div style={styles.grid}>
          {/* Left Column - Form */}
          <div style={styles.formSection}>
            <form onSubmit={handleSubmit}>
              {/* Contact Information */}
              <div style={styles.section}>
                <h2 style={styles.sectionTitle}>Contact Information</h2>
                
                <div style={styles.formGroup}>
                  <label style={styles.label}>Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    style={styles.input}
                    required
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    style={styles.input}
                    required
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    style={styles.input}
                    required
                  />
                </div>
              </div>

              {/* Delivery Address */}
              <div style={styles.section}>
                <h2 style={styles.sectionTitle}>Delivery Address</h2>
                
                <div style={styles.formGroup}>
                  <label style={styles.label}>Address *</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    style={styles.textarea}
                    rows="3"
                    required
                  />
                </div>


                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>City *</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      style={styles.input}
                      required
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Pincode *</label>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      style={styles.input}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div style={styles.section}>
                <h2 style={styles.sectionTitle}>Payment Method</h2>
                
                <div style={styles.radioGroup}>
                  <label style={styles.radioLabel}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={formData.paymentMethod === 'cod'}
                      onChange={handleChange}
                      style={styles.radio}
                    />
                    <span style={styles.radioText}>Cash on Delivery</span>
                  </label>

                  <label style={styles.radioLabel}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="online"
                      checked={formData.paymentMethod === 'online'}
                      onChange={handleChange}
                      style={styles.radio}
                    />
                    <span style={styles.radioText}>Online Payment (Coming Soon)</span>
                  </label>
                </div>
              </div>

              <button 
                type="submit" 
                style={styles.submitBtn}
                disabled={loading}
              >
                {loading ? 'Placing Order...' : 'Place Order'}
              </button>
            </form>
          </div>

          {/* Right Column - Order Summary */}
          <div style={styles.summarySection}>
            <div style={styles.summaryCard}>
              <h2 style={styles.summaryTitle}>Order Summary</h2>

              <div style={styles.summaryItems}>
                {cartItems.map((item) => (
                  <div key={item._id} style={styles.summaryItem}>
                    <div style={styles.itemInfo}>
                      <span style={styles.itemName}>{item.name}</span>
                      <span style={styles.itemQty}>× {item.quantity}</span>
                    </div>
                    <span style={styles.itemPrice}>₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              <div style={styles.summaryDivider}></div>

              <div style={styles.summaryRow}>
                <span style={styles.summaryLabel}>Subtotal ({getTotalItems()} items)</span>
                <span style={styles.summaryValue}>₹{getTotalPrice()}</span>
              </div>

              <div style={styles.summaryRow}>
                <span style={styles.summaryLabel}>Delivery</span>
                <span style={styles.summaryValue}>Free</span>
              </div>

              <div style={styles.summaryDivider}></div>

              <div style={styles.totalRow}>
                <span style={styles.totalLabel}>Total</span>
                <span style={styles.totalValue}>₹{getTotalPrice()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#FFFFFF',
    padding: '2rem'
  },
  content: {
    maxWidth: '1200px',
    margin: '0 auto'
  },
  title: {
    fontSize: '2rem',
    fontWeight: '300',
    color: '#1A1A1A',
    marginBottom: '2rem',
    letterSpacing: '0.5px'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 400px',
    gap: '3rem'
  },
  formSection: {
    
  },
  section: {
    marginBottom: '2.5rem'
  },
  sectionTitle: {
    fontSize: '1.125rem',
    fontWeight: '400',
    color: '#1A1A1A',
    marginBottom: '1.5rem',
    letterSpacing: '0.3px'
  },
  formGroup: {
    marginBottom: '1.25rem',
    flex: 1
  },
  formRow: {
    display: 'flex',
    gap: '1rem'
  },
  label: {
    display: 'block',
    fontSize: '0.875rem',
    color: '#5A5A5A',
    marginBottom: '0.5rem',
    letterSpacing: '0.2px'
  },
  input: {
    width: '100%',
    padding: '0.875rem',
    fontSize: '0.9375rem',
    border: '1px solid #E5E2DD',
    borderRadius: '2px',
    outline: 'none',
    fontFamily: 'inherit',
    color: '#1A1A1A',
    transition: 'border-color 0.2s'
  },
  textarea: {
    width: '100%',
    padding: '0.875rem',
    fontSize: '0.9375rem',
    border: '1px solid #E5E2DD',
    borderRadius: '2px',
    outline: 'none',
    fontFamily: 'inherit',
    color: '#1A1A1A',
    resize: 'vertical'
  },
  radioGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  radioLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    cursor: 'pointer',
    padding: '1rem',
    border: '1px solid #E5E2DD',
    borderRadius: '2px'
  },
  radio: {
    width: '18px',
    height: '18px',
    cursor: 'pointer'
  },
  radioText: {
    fontSize: '0.9375rem',
    color: '#1A1A1A'
  },
  submitBtn: {
    width: '100%',
    padding: '1rem',
    background: '#1A1A1A',
    color: '#FFFFFF',
    border: 'none',
    fontSize: '0.875rem',
    fontWeight: '500',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
    cursor: 'pointer',
    transition: 'background 0.2s'
  },
  summarySection: {
    position: 'sticky',
    top: '2rem',
    alignSelf: 'start'
  },
  summaryCard: {
    background: '#F8F7F5',
    padding: '2rem'
  },
  summaryTitle: {
    fontSize: '1.125rem',
    fontWeight: '400',
    color: '#1A1A1A',
    marginBottom: '1.5rem',
    letterSpacing: '0.3px'
  },
  summaryItems: {
    marginBottom: '1.5rem'
  },
  summaryItem: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '1rem'
  },
  itemInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem'
  },
  itemName: {
    fontSize: '0.9375rem',
    color: '#1A1A1A'
  },
  itemQty: {
    fontSize: '0.8125rem',
    color: '#8B8B8B'
  },
  itemPrice: {
    fontSize: '0.9375rem',
    color: '#1A1A1A'
  },
  summaryDivider: {
    height: '1px',
    background: '#E5E2DD',
    margin: '1.5rem 0'
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '1rem'
  },
  summaryLabel: {
    fontSize: '0.9375rem',
    color: '#5A5A5A'
  },
  summaryValue: {
    fontSize: '0.9375rem',
    color: '#1A1A1A'
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '1.5rem'
  },
  totalLabel: {
    fontSize: '1.125rem',
    fontWeight: '400',
    color: '#1A1A1A'
  },
  totalValue: {
    fontSize: '1.5rem',
    fontWeight: '400',
    color: '#1A1A1A'
  }
};

export default Checkout;
