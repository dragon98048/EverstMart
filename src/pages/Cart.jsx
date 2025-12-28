import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleMap, LoadScript, Marker, Autocomplete } from '@react-google-maps/api';
import axios from 'axios';

const GOOGLE_MAPS_LIBRARIES = ['places'];

function Cart() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: 19.0760, lng: 72.8777 });
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [shippingAddress, setShippingAddress] = useState({
    name: '',
    phone: '',
    street: '',
    landmark: '',
    area: '',
    city: '',
    state: '',
    zipCode: '',
    location: null
  });
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [user, setUser] = useState(null);
  
  const autocompleteRef = useRef(null);

  useEffect(() => {
    loadCart();
    loadUser();
    
    window.addEventListener('cartUpdated', loadCart);
    return () => window.removeEventListener('cartUpdated', loadCart);
  }, []);

  const loadCart = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartItems(cart);
  };

  const loadUser = () => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(userData);
    if (userData.name) {
      setShippingAddress(prev => ({
        ...prev,
        name: userData.name || '',
        phone: userData.phone || ''
      }));
    }
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeItem(productId);
      return;
    }

    const updatedCart = cartItems.map(item =>
      item._id === productId ? { ...item, quantity: newQuantity } : item
    );
    
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const removeItem = (productId) => {
    const updatedCart = cartItems.filter(item => item._id !== productId);
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.setItem('cart', JSON.stringify([]));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  // ✅ BLINKIT-STYLE: Detailed Address Extraction
  const extractDetailedAddress = (result) => {
    const addressComponents = result.address_components;
    
    let street = '';
    let landmark = '';
    let area = '';
    let sublocality = '';
    let city = '';
    let state = '';
    let zipCode = '';
    
    addressComponents.forEach(component => {
      const types = component.types;
      
      // Landmark/Building (e.g., "CP Goenka School")
      if (types.includes('premise') || types.includes('establishment')) {
        landmark = component.long_name;
      }
      
      // Street/Road name
      if (types.includes('route')) {
        street = component.long_name;
      }
      
      // Area/Neighborhood (e.g., "Ulwe", "Sector 19")
      if (types.includes('sublocality_level_2')) {
        area = component.long_name;
      }
      if (types.includes('sublocality_level_1')) {
        sublocality = component.long_name;
      }
      
      // City
      if (types.includes('locality')) {
        city = component.long_name;
      }
      
      // State
      if (types.includes('administrative_area_level_1')) {
        state = component.long_name;
      }
      
      // Pincode
      if (types.includes('postal_code')) {
        zipCode = component.long_name;
      }
    });
    
    // Build comprehensive street address
    let fullStreet = '';
    if (landmark) fullStreet += landmark;
    if (street) fullStreet += (fullStreet ? ', ' : '') + street;
    if (area) fullStreet += (fullStreet ? ', ' : '') + area;
    
    return {
      street: fullStreet || result.formatted_address.split(',')[0] || 'GPS Location',
      landmark: landmark,
      area: sublocality || area || '',
      city: city || 'Mumbai',
      state: state || 'Maharashtra',
      zipCode: zipCode || '400001'
    };
  };

  // ✅ GPS Location with Detailed Address
  const useCurrentLocation = () => {
    setLoadingLocation(true);
    
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          
          setMapCenter({ lat: location.latitude, lng: location.longitude });
          setSelectedLocation(location);
          
          try {
            // ✅ Use Places API for more detailed results
            const response = await axios.get(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${location.latitude},${location.longitude}&key=AIzaSyBxYHyG4YD4aNXR84uRcTZQdX6XvxJwxYk&result_type=premise|street_address|sublocality`
            );
            
            if (response.data.results[0]) {
              const addressData = extractDetailedAddress(response.data.results[0]);
              
              setShippingAddress(prev => ({
                ...prev,
                ...addressData,
                location
              }));
              
              alert(`✅ Location Detected!\n\n${addressData.street}\n${addressData.area ? addressData.area + ', ' : ''}${addressData.city}\n${addressData.state} - ${addressData.zipCode}`);
              setShowMap(false);
            }
          } catch (error) {
            console.error('Geocoding error:', error);
            alert('⚠️ GPS detected but could not get full address. Please enter manually.');
          }
          
          setLoadingLocation(false);
        },
        (error) => {
          let errorMsg = '❌ Location Error: ';
          if (error.code === 1) errorMsg += 'Please enable location permission';
          else if (error.code === 2) errorMsg += 'Location unavailable';
          else errorMsg += 'Request timeout';
          
          alert(errorMsg);
          setLoadingLocation(false);
        },
        { 
          enableHighAccuracy: true,
          timeout: 30000,
          maximumAge: 0
        }
      );
    } else {
      alert('❌ Geolocation not supported');
      setLoadingLocation(false);
    }
  };

  // ✅ Handle Autocomplete Place Selection
  const onPlaceSelected = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      
      if (place.geometry) {
        const location = {
          latitude: place.geometry.location.lat(),
          longitude: place.geometry.location.lng()
        };
        
        const addressData = extractDetailedAddress(place);
        
        setShippingAddress(prev => ({
          ...prev,
          ...addressData,
          location
        }));
        
        setMapCenter({ lat: location.latitude, lng: location.longitude });
        setSelectedLocation(location);
      }
    }
  };

  // Map click handler
  const handleMapClick = async (e) => {
    const location = {
      latitude: e.latLng.lat(),
      longitude: e.latLng.lng()
    };
    
    setSelectedLocation(location);
    
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${location.latitude},${location.longitude}&key=AIzaSyBxYHyG4YD4aNXR84uRcTZQdX6XvxJwxYk`
      );
      
      if (response.data.results[0]) {
        const addressData = extractDetailedAddress(response.data.results[0]);
        
        setShippingAddress(prev => ({
          ...prev,
          ...addressData,
          location
        }));
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }
  };

  // Add this function after handleCOD function in Cart.jsx

const handleOnlinePayment = async () => {
  if (!user) {
    alert('Please login first!');
    navigate('/login');
    return;
  }

  if (!shippingAddress.phone) {
    alert('Please enter your phone number');
    return;
  }

  if (!shippingAddress.street) {
    alert('Please enter delivery address or use GPS location');
    return;
  }

  try {
    const token = localStorage.getItem('token');
    
    const orderData = {
      items: cartItems.map(item => ({
        product: item._id,
        name: item.name,
        quantity: item.quantity,
        price: item.price
      })),
      shippingAddress,
      totalAmount: getTotalPrice()
    };

    // Initiate PayU payment
    const response = await axios.post('http://localhost:5000/api/payments/payu/initiate', 
      { orderData }, 
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (response.data.success) {
      // Create form and submit to PayU
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = response.data.payuUrl;

      // Add all PayU parameters
      Object.keys(response.data.payuData).forEach(key => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = response.data.payuData[key];
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
    }
  } catch (error) {
    console.error('Payment error:', error);
    alert('Payment initiation failed: ' + (error.response?.data?.error || error.message));
  }
};

  // Handle COD Payment
  const handleCOD = async () => {
    if (!user) {
      alert('Please login first!');
      navigate('/login');
      return;
    }

    if (!shippingAddress.phone) {
      alert('Please enter your phone number');
      return;
    }

    if (!shippingAddress.street) {
      alert('Please enter delivery address or use GPS location');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      const orderData = {
        items: cartItems.map(item => ({
          product: item._id,
          name: item.name,
          quantity: item.quantity,
          price: item.price
        })),
        shippingAddress,
        totalAmount: getTotalPrice(),
        paymentMethod: 'COD'
      };

      await axios.post('http://localhost:5000/api/payments/cod', 
        { orderData }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert('✅ Order placed successfully! Delivery in 10 minutes.');
      clearCart();
      setShowCheckout(false);
      navigate('/');
    } catch (error) {
      console.error('COD error:', error);
      alert('Order failed: ' + (error.response?.data?.error || error.message));
    }
  };

  if (cartItems.length === 0) {
    return (
      <div style={styles.emptyCart}>
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" style={styles.emptyIcon}>
          <path d="M9 2C7.89543 2 7 2.89543 7 4V6H5C3.89543 6 3 6.89543 3 8V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V8C21 6.89543 20.1046 6 19 6H17V4C17 2.89543 16.1046 2 15 2H9Z" stroke="#E5E2DD" strokeWidth="2"/>
        </svg>
        <h2 style={styles.emptyTitle}>Your cart is empty</h2>
        <p style={styles.emptyText}>Add products to get started</p>
        <button style={styles.continueBtn} onClick={() => navigate('/')}>
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <LoadScript 
      googleMapsApiKey="AIzaSyBxYHyG4YD4aNXR84uRcTZQdX6XvxJwxYk"
      libraries={GOOGLE_MAPS_LIBRARIES}
    >
      <div style={styles.container}>
        <div style={styles.content}>
          <div style={styles.header}>
            <h1 style={styles.title}>Shopping Cart</h1>
            <button style={styles.clearBtn} onClick={clearCart}>Clear Cart</button>
          </div>

          <div style={styles.itemsContainer}>
            {cartItems.map((item) => (
              <div key={item._id} style={styles.cartItem}>
                <div style={styles.itemImage}>
                  {item.image && (
                    <img 
                      src={item.image.startsWith('data:') ? item.image : `http://localhost:5000${item.image}`}
                      alt={item.name}
                      style={styles.productImage}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.style.background = '#F0EDE8';
                      }}
                    />
                  )}
                </div>

                <div style={styles.itemDetails}>
                  <h3 style={styles.itemName}>{item.name}</h3>
                  <p style={styles.itemUnit}>{item.unitQuantity} {item.unit}</p>
                  <p style={styles.itemPrice}>₹{item.price}</p>
                </div>

                <div style={styles.itemActions}>
                  <div style={styles.quantityControl}>
                    <button 
                      style={styles.quantityBtn}
                      onClick={() => updateQuantity(item._id, item.quantity - 1)}
                    >
                      −
                    </button>
                    <span style={styles.quantity}>{item.quantity}</span>
                    <button 
                      style={styles.quantityBtn}
                      onClick={() => updateQuantity(item._id, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>

                  <p style={styles.itemTotal}>₹{item.price * item.quantity}</p>

                  <button 
                    style={styles.removeBtn}
                    onClick={() => removeItem(item._id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div style={styles.summary}>
            <div style={styles.summaryRow}>
              <span style={styles.summaryLabel}>Subtotal ({getTotalItems()} items)</span>
              <span style={styles.summaryValue}>₹{getTotalPrice()}</span>
            </div>
            <div style={styles.summaryRow}>
              <span style={styles.summaryLabel}>Delivery</span>
              <span style={styles.summaryValue}>Free</span>
            </div>
            <div style={styles.totalRow}>
              <span style={styles.totalLabel}>Total</span>
              <span style={styles.totalValue}>₹{getTotalPrice()}</span>
            </div>

            <button 
              style={styles.checkoutBtn}
              onClick={() => setShowCheckout(!showCheckout)}
            >
              {showCheckout ? 'Cancel Checkout' : 'Proceed to Checkout'}
            </button>
          </div>

          {showCheckout && (
            <div style={styles.checkoutSection}>
              <h2 style={styles.checkoutTitle}>Delivery Details</h2>

              {/* ✅ BLINKIT-STYLE: GPS Button */}
              <button 
                type="button"
                onClick={useCurrentLocation} 
                disabled={loadingLocation}
                style={styles.gpsBtn}
              >
                {loadingLocation ? '⏳ Detecting location...' : '📍 Use My Current Location'}
              </button>

              {shippingAddress.location && (
                <div style={styles.locationConfirm}>
                  ✅ Location Saved: {shippingAddress.street}
                </div>
              )}

              <div style={styles.divider}>OR search address</div>

              {/* ✅ BLINKIT-STYLE: Address Autocomplete */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Search your location *</label>
                <Autocomplete
                  onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)}
                  onPlaceChanged={onPlaceSelected}
                  options={{
                    componentRestrictions: { country: 'in' },
                    fields: ['address_components', 'geometry', 'formatted_address']
                  }}
                >
                  <input
                    type="text"
                    placeholder="Search for area, street name..."
                    style={styles.input}
                  />
                </Autocomplete>
              </div>

              {/* Contact Info */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Full Name *</label>
                <input
                  type="text"
                  value={shippingAddress.name}
                  onChange={(e) => setShippingAddress({...shippingAddress, name: e.target.value})}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Phone Number *</label>
                <input
                  type="tel"
                  value={shippingAddress.phone}
                  onChange={(e) => setShippingAddress({...shippingAddress, phone: e.target.value})}
                  style={styles.input}
                  placeholder="10 digits"
                  required
                />
              </div>

              {/* Address Fields */}
              <div style={styles.formGroup}>
                <label style={styles.label}>House/Flat/Block No. *</label>
                <input
                  type="text"
                  value={shippingAddress.street}
                  onChange={(e) => setShippingAddress({...shippingAddress, street: e.target.value})}
                  style={styles.input}
                  placeholder="e.g., A-101, Maple Apartments"
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Landmark (Optional)</label>
                <input
                  type="text"
                  value={shippingAddress.landmark}
                  onChange={(e) => setShippingAddress({...shippingAddress, landmark: e.target.value})}
                  style={styles.input}
                  placeholder="e.g., Near Central Mall"
                />
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Area *</label>
                  <input
                    type="text"
                    value={shippingAddress.area}
                    onChange={(e) => setShippingAddress({...shippingAddress, area: e.target.value})}
                    style={styles.input}
                    placeholder="e.g., Ulwe, Sector 19"
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>City *</label>
                  <input
                    type="text"
                    value={shippingAddress.city}
                    onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
                    style={styles.input}
                    required
                  />
                </div>
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>State *</label>
                  <input
                    type="text"
                    value={shippingAddress.state}
                    onChange={(e) => setShippingAddress({...shippingAddress, state: e.target.value})}
                    style={styles.input}
                    required
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Pincode *</label>
                  <input
                    type="text"
                    value={shippingAddress.zipCode}
                    onChange={(e) => setShippingAddress({...shippingAddress, zipCode: e.target.value})}
                    style={styles.input}
                    required
                  />
                </div>
              </div>

              {/* Payment */}
{/* Payment Method */}
<div style={styles.paymentSection}>
  <h3 style={styles.paymentTitle}>Payment Method</h3>
  
  {/* Online Payment Button */}
  <button 
    type="button" 
    onClick={handleOnlinePayment} 
    style={styles.onlineBtn}
  >
    💳 Pay Online - ₹{getTotalPrice()}
    <span style={styles.paymentSubtext}>UPI • Cards • Net Banking</span>
  </button>

  {/* COD Button */}
  <button 
    type="button" 
    onClick={handleCOD} 
    style={styles.codBtn}
  >
    💰 Cash on Delivery - ₹{getTotalPrice()}
  </button>
</div>

            </div>
          )}
        </div>
      </div>
    </LoadScript>
  );
}

// Styles remain the same...
const styles = {
  container: { minHeight: '100vh', background: '#FFFFFF', padding: '2rem' },
  content: { maxWidth: '1000px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid #E5E2DD' },
  title: { fontSize: '2rem', fontWeight: '300', color: '#1A1A1A', letterSpacing: '0.5px' },
  clearBtn: { padding: '0.5rem 1rem', background: 'transparent', border: '1px solid #E5E2DD', color: '#5A5A5A', fontSize: '0.875rem', cursor: 'pointer' },
  itemsContainer: { marginBottom: '2rem' },
  cartItem: { display: 'grid', gridTemplateColumns: '100px 1fr auto', gap: '1.5rem', padding: '1.5rem 0', borderBottom: '1px solid #F0EDE8', alignItems: 'center' },
  itemImage: { width: '100px', height: '100px', background: '#F8F7F5' },
  productImage: { width: '100%', height: '100%', objectFit: 'cover' },
  itemDetails: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  itemName: { fontSize: '1rem', fontWeight: '400', color: '#1A1A1A' },
  itemUnit: { fontSize: '0.8125rem', color: '#8B8B8B' },
  itemPrice: { fontSize: '0.9375rem', color: '#5A5A5A' },
  itemActions: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '1rem' },
  quantityControl: { display: 'flex', alignItems: 'center', gap: '0.75rem', border: '1px solid #E5E2DD', padding: '0.25rem' },
  quantityBtn: { width: '32px', height: '32px', background: 'transparent', border: 'none', color: '#1A1A1A', fontSize: '1.125rem', cursor: 'pointer' },
  quantity: { fontSize: '0.9375rem', minWidth: '30px', textAlign: 'center' },
  itemTotal: { fontSize: '1.125rem', fontWeight: '400', color: '#1A1A1A' },
  removeBtn: { background: 'transparent', border: 'none', color: '#8B8B8B', fontSize: '0.8125rem', cursor: 'pointer', textDecoration: 'underline' },
  summary: { marginTop: '3rem', padding: '2rem', background: '#F8F7F5' },
  summaryRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' },
  summaryLabel: { fontSize: '0.9375rem', color: '#5A5A5A' },
  summaryValue: { fontSize: '0.9375rem', color: '#1A1A1A' },
  totalRow: { display: 'flex', justifyContent: 'space-between', paddingTop: '1rem', marginTop: '1rem', borderTop: '1px solid #E5E2DD' },
  totalLabel: { fontSize: '1.125rem', fontWeight: '400' },
  totalValue: { fontSize: '1.5rem', fontWeight: '400' },
  checkoutBtn: { width: '100%', padding: '1rem', marginTop: '1.5rem', background: '#1A1A1A', color: '#FFFFFF', border: 'none', fontSize: '0.875rem', fontWeight: '500', letterSpacing: '0.5px', textTransform: 'uppercase', cursor: 'pointer' },
  checkoutSection: { marginTop: '2rem', padding: '2rem', background: '#FFFFFF', border: '1px solid #E5E2DD' },
  checkoutTitle: { fontSize: '1.5rem', fontWeight: '300', marginBottom: '1.5rem', color: '#1A1A1A' },
  gpsBtn: { width: '100%', padding: '1rem', background: '#8B7355', color: 'white', border: 'none', fontSize: '0.9375rem', fontWeight: '500', cursor: 'pointer', marginBottom: '1rem', letterSpacing: '0.3px' },
  locationConfirm: { background: '#F0EDE8', color: '#5C7A5C', padding: '0.75rem', marginBottom: '1rem', fontSize: '0.875rem' },
  divider: { textAlign: 'center', color: '#8B8B8B', margin: '1.5rem 0', fontSize: '0.875rem' },
  formGroup: { marginBottom: '1.25rem', flex: 1 },
  formRow: { display: 'flex', gap: '1rem' },
  label: { display: 'block', fontSize: '0.875rem', color: '#5A5A5A', marginBottom: '0.5rem' },
  input: { width: '100%', padding: '0.875rem', border: '1px solid #E5E2DD', fontSize: '0.9375rem', outline: 'none' },
  paymentSection: { marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid #E5E2DD' },
  paymentTitle: { fontSize: '1.125rem', fontWeight: '400', marginBottom: '1rem' },
  codBtn: { width: '100%', padding: '1rem', background: '#1A1A1A', color: '#FFFFFF', border: 'none', fontSize: '0.9375rem', fontWeight: '500', cursor: 'pointer', letterSpacing: '0.3px' },
  emptyCart: { minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' },
  emptyIcon: { marginBottom: '2rem', opacity: 0.3 },
  emptyTitle: { fontSize: '1.5rem', fontWeight: '300', color: '#1A1A1A', marginBottom: '0.5rem' },
  emptyText: { fontSize: '1rem', color: '#8B8B8B', marginBottom: '2rem' },
  continueBtn: { padding: '1rem 2rem', background: '#1A1A1A', color: '#FFFFFF', border: 'none', fontSize: '0.875rem', fontWeight: '500', textTransform: 'uppercase', cursor: 'pointer' },
  onlineBtn: {
  width: '100%',
  padding: '1rem',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: '#FFFFFF',
  border: 'none',
  fontSize: '0.9375rem',
  fontWeight: '500',
  cursor: 'pointer',
  letterSpacing: '0.3px',
  marginBottom: '1rem',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '0.25rem'
},
paymentSubtext: {
  fontSize: '0.75rem',
  opacity: 0.9,
  fontWeight: '400'
},

};

export default Cart;
