import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../css/ProductForm.css';

const API_URL = 'http://localhost:5000/api/products';

function ProductForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: ''
  });
  const [photos, setPhotos] = useState([]);
  const [newPhotos, setNewPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`${API_URL}/${id}`);
      const data = await response.json();

      if (data.success) {
        const product = data.product;
        setFormData({
          name: product.name,
          description: product.description,
          price: product.price,
          category: product.category,
          stock: product.stock
        });
        setPhotos(product.photos || []);
      } else {
        setError('Product not found');
      }
    } catch (err) {
      setError('Error loading product');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    setNewPhotos(files);
  };

  const removePhoto = async (photoUrl) => {
    if (!isEdit) {
      setPhotos(photos.filter(p => p !== photoUrl));
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/${id}/photo`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ photoUrl })
      });

      const data = await response.json();
      if (data.success) {
        setPhotos(photos.filter(p => p !== photoUrl));
      } else {
        alert(data.message || 'Failed to remove photo');
      }
    } catch (err) {
      alert('Error removing photo');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();
      
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('stock', formData.stock);

      if (isEdit && photos.length === 0 && newPhotos.length > 0) {
        formDataToSend.append('replacePhotos', 'true');
      }

      newPhotos.forEach((photo) => {
        formDataToSend.append('photos', photo);
      });

      const url = isEdit ? `${API_URL}/${id}` : API_URL;
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      const data = await response.json();

      if (data.success) {
        navigate('/products');
      } else {
        setError(data.message || 'Failed to save product');
      }
    } catch (err) {
      setError('Error saving product');
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return <div className="product-form-container">Please log in to create products</div>;
  }

  return (
    <div className="product-form-container">
      <h1>{isEdit ? 'Edit Product' : 'Create New Product'}</h1>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="product-form">
        <div className="form-group">
          <label>Product Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Enter product name"
          />
        </div>

        <div className="form-group">
          <label>Description *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows="4"
            placeholder="Enter product description"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Price *</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              placeholder="0.00"
            />
          </div>

          <div className="form-group">
            <label>Stock *</label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              required
              min="0"
              placeholder="0"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Category *</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
          >
            <option value="">Select category</option>
            <option value="electronics">Electronics</option>
            <option value="clothing">Clothing</option>
            <option value="food">Food</option>
            <option value="books">Books</option>
            <option value="sports">Sports</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="form-group">
          <label>Photos (up to 10 images)</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handlePhotoChange}
          />
          {newPhotos.length > 0 && (
            <div className="photo-preview">
              <p>New photos to upload: {newPhotos.length}</p>
            </div>
          )}
        </div>

        {photos.length > 0 && (
          <div className="form-group">
            <label>Current Photos</label>
            <div className="photos-grid">
              {photos.map((photo, index) => (
                <div key={index} className="photo-item">
                  <img src={photo} alt={`Product ${index + 1}`} />
                  <button
                    type="button"
                    onClick={() => removePhoto(photo)}
                    className="remove-photo-btn"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="form-actions">
          <button type="submit" disabled={loading} className="btn-submit">
            {loading ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/products')}
            className="btn-cancel"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default ProductForm;

