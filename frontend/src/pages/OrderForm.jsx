import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../css/OrderForm.css';

const API_URL = 'http://localhost:5000/api';

function OrderForm() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);
  const [shippingAddress, setShippingAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('cash_on_delivery');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    // Load cart from localStorage or fetch products
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (savedCart.length > 0) {
      setCart(savedCart);
      fetchProducts(savedCart);
    } else {
      fetchAllProducts();
    }
  }, []);

  const fetchProducts = async (cartItems) => {
    try {
      const productIds = cartItems.map(item => item.productId);
      const productPromises = productIds.map(id =>
        fetch(`${API_URL}/products/${id}`).then(res => res.json())
      );
      const productData = await Promise.all(productPromises);
      setProducts(productData.filter(p => p.success).map(p => p.product));
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const fetchAllProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/products?limit=100`);
      const data = await response.json();
      if (data.success) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.productId === product._id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.productId === product._id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, {
        productId: product._id,
        quantity: 1,
        price: product.price
      }]);
    }
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      setCart(cart.filter(item => item.productId !== productId));
    } else {
      setCart(cart.map(item =>
        item.productId === productId
          ? { ...item, quantity: parseInt(quantity) }
          : item
      ));
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      const product = products.find(p => p._id === item.productId);
      return total + (product?.price || item.price) * item.quantity;
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (cart.length === 0) {
      setError('Please add at least one product to the order');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          items: cart,
          shippingAddress,
          paymentMethod
        })
      });

      const data = await response.json();

      if (data.success) {
        localStorage.removeItem('cart');
        navigate(`/orders/${data.order._id}`);
      } else {
        setError(data.message || 'Failed to create order');
      }
    } catch (err) {
      setError('Error creating order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="order-form-container">
      <h1>Create New Order</h1>

      {error && <div className="error-message">{error}</div>}

      <div className="order-form-layout">
        <div className="products-section">
          <h2>Available Products</h2>
          <div className="products-list">
            {products.map((product) => (
              <div key={product._id} className="product-item">
                {product.photos?.[0] && (
                  <img src={product.photos[0]} alt={product.name} />
                )}
                <div className="product-info">
                  <h4>{product.name}</h4>
                  <p>${product.price} - Stock: {product.stock}</p>
                </div>
                <button
                  onClick={() => addToCart(product)}
                  disabled={product.stock === 0}
                  className="btn-add"
                >
                  Add
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="order-section">
          <h2>Order Summary</h2>

          {cart.length === 0 ? (
            <p className="empty-cart">No items in cart</p>
          ) : (
            <div className="cart-items">
              {cart.map((item) => {
                const product = products.find(p => p._id === item.productId);
                return (
                  <div key={item.productId} className="cart-item">
                    {product?.photos?.[0] && (
                      <img src={product.photos[0]} alt={product.name} />
                    )}
                    <div className="item-info">
                      <h4>{product?.name || 'Product'}</h4>
                      <p>${product?.price || item.price} each</p>
                    </div>
                    <input
                      type="number"
                      min="1"
                      max={product?.stock || 999}
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item.productId, e.target.value)}
                      className="quantity-input"
                    />
                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className="btn-remove"
                    >
                      Remove
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          <div className="order-total">
            <strong>Total: ${calculateTotal().toFixed(2)}</strong>
          </div>

          <form onSubmit={handleSubmit} className="order-form">
            <h3>Shipping Address</h3>
            <div className="form-group">
              <label>Street *</label>
              <input
                type="text"
                value={shippingAddress.street}
                onChange={(e) => setShippingAddress({...shippingAddress, street: e.target.value})}
                required
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>City *</label>
                <input
                  type="text"
                  value={shippingAddress.city}
                  onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>State *</label>
                <input
                  type="text"
                  value={shippingAddress.state}
                  onChange={(e) => setShippingAddress({...shippingAddress, state: e.target.value})}
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Zip Code *</label>
                <input
                  type="text"
                  value={shippingAddress.zipCode}
                  onChange={(e) => setShippingAddress({...shippingAddress, zipCode: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Country *</label>
                <input
                  type="text"
                  value={shippingAddress.country}
                  onChange={(e) => setShippingAddress({...shippingAddress, country: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Payment Method *</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                required
              >
                <option value="cash_on_delivery">Cash on Delivery</option>
                <option value="credit_card">Credit Card</option>
                <option value="debit_card">Debit Card</option>
                <option value="paypal">PayPal</option>
              </select>
            </div>

            <button type="submit" disabled={loading || cart.length === 0} className="btn-submit">
              {loading ? 'Creating Order...' : 'Create Order'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default OrderForm;

