import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useCart } from './context/CartContext';
import CartIcon from './components/CartIcon';
import './css/Home.css';

const API_URL = 'http://localhost:5000/api/products';

function Home() {
  const { currentUser } = useAuth();
  const { addToCart, getCartItem } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    fetchProducts();
  }, [category, search]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: '1',
        limit: '12'
      });
      if (category) params.append('category', category);
      if (search) params.append('search', search);

      const response = await fetch(`${API_URL}?${params}`);
      const data = await response.json();

      if (data.success) {
        setProducts(data.products);
      } else {
        setError(data.message || 'Failed to fetch products');
      }
    } catch (err) {
      setError('Error loading products');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-container">
      <header className="home-header">
        <div className="home-nav">
          <Link to="/" className="home-logo">RunMate</Link>
          <div className="home-nav-links">
            <Link to="/products" className="nav-link">Products</Link>
            {currentUser ? (
              <>
                <Link to="/profile" className="nav-link">Profile</Link>
                {currentUser.isAdmin && (
                  <Link to="/admin" className="nav-link">Admin</Link>
                )}
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link">Login</Link>
                <Link to="/signup" className="nav-link">Sign Up</Link>
              </>
            )}
            <CartIcon />
          </div>
        </div>
        <div className="home-header-content">
          <h1 className="home-title">Welcome to RunMate</h1>
          <p className="home-subtitle">Discover amazing products for your active lifestyle</p>
        </div>
      </header>

      <div className="home-content">
        <div className="home-filters">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="category-select"
          >
            <option value="">All Categories</option>
            <option value="electronics">Electronics</option>
            <option value="clothing">Clothing</option>
            <option value="food">Food</option>
            <option value="books">Books</option>
            <option value="sports">Sports</option>
            <option value="other">Other</option>
          </select>
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading">Loading products...</div>
        ) : (
          <>
            {products.length === 0 ? (
              <div className="no-products">
                <p>No products found</p>
              </div>
            ) : (
              <div className="products-grid">
                {products.map((product) => (
                  <div key={product._id} className="product-card">
                    {product.photos && product.photos.length > 0 && (
                      <div className="product-image">
                        <img src={product.photos[0]} alt={product.name} />
                      </div>
                    )}
                    <div className="product-info">
                      <h3 className="product-name">{product.name}</h3>
                      <p className="product-description">
                        {product.description?.substring(0, 100)}
                        {product.description?.length > 100 ? '...' : ''}
                      </p>
                      <div className="product-details">
                        <span className="product-price">${product.price}</span>
                        {product.stock > 0 ? (
                          <span className="product-stock in-stock">In Stock</span>
                        ) : (
                          <span className="product-stock out-of-stock">Out of Stock</span>
                        )}
                      </div>
                      <div className="product-actions">
                        <Link to={`/products/${product._id}`} className="btn-view-details">
                          View Details
                        </Link>
                        {product.stock > 0 && (
                          <button
                            onClick={() => {
                              const wasAdded = addToCart(product, 1);
                              if (!wasAdded) {
                                alert('This item is already in your cart. Update quantity in cart.');
                              }
                            }}
                            className="btn-add-to-cart"
                            disabled={getCartItem(product._id) !== undefined}
                          >
                            {getCartItem(product._id) ? 'In Cart' : 'Add to Cart'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {!loading && products.length > 0 && (
          <div className="view-all-section">
            <Link to="/products" className="btn-view-all">
              View All Products
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
