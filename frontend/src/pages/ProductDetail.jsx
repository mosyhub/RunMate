import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../css/ProductDetail.css';

const API_URL = 'http://localhost:5000/api/products';

function ProductDetail() {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`${API_URL}/${id}`);
      const data = await response.json();

      if (data.success) {
        setProduct(data.product);
      } else {
        setError('Product not found');
      }
    } catch (err) {
      setError('Error loading product');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToOrder = () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    // Store product in localStorage for order creation
    const orderItem = {
      productId: product._id,
      quantity: parseInt(quantity),
      price: product.price
    };

    const existingItems = JSON.parse(localStorage.getItem('cart') || '[]');
    existingItems.push(orderItem);
    localStorage.setItem('cart', JSON.stringify(existingItems));
    
    alert('Product added to cart!');
  };

  if (loading) {
    return <div className="product-detail-container">Loading...</div>;
  }

  if (error || !product) {
    return <div className="product-detail-container">{error || 'Product not found'}</div>;
  }

  return (
    <div className="product-detail-container">
      <Link to="/products" className="back-link">← Back to Products</Link>

      <div className="product-detail">
        <div className="product-images">
          {product.photos && product.photos.length > 0 ? (
            <div className="main-image">
              <img src={product.photos[0]} alt={product.name} />
            </div>
          ) : (
            <div className="main-image no-image">No Image</div>
          )}
          {product.photos && product.photos.length > 1 && (
            <div className="thumbnail-images">
              {product.photos.map((photo, index) => (
                <img key={index} src={photo} alt={`${product.name} ${index + 1}`} />
              ))}
            </div>
          )}
        </div>

        <div className="product-info">
          <h1>{product.name}</h1>
          <p className="product-category">Category: {product.category}</p>
          <p className="product-description">{product.description}</p>
          
          <div className="product-pricing">
            <span className="product-price">${product.price}</span>
            <span className="product-stock">Stock: {product.stock}</span>
          </div>

          {currentUser && currentUser.id === product.createdBy?._id && (
            <div className="owner-actions">
              <Link to={`/products/${product._id}/edit`} className="btn-edit">
                Edit Product
              </Link>
            </div>
          )}

          {currentUser && currentUser.id !== product.createdBy?._id && (
            <div className="purchase-section">
              <div className="quantity-selector">
                <label>Quantity:</label>
                <input
                  type="number"
                  min="1"
                  max={product.stock}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </div>
              <button
                onClick={handleAddToOrder}
                disabled={product.stock === 0}
                className="btn-add-to-cart"
              >
                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;

