import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const API_URL = 'http://localhost:5000/api/products';

function StarRatingDisplay({ rating }) {
  return (
    <div className="flex gap-1 text-lg">
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className={star <= rating ? 'text-orange-500' : 'text-gray-300'}>
          ★
        </span>
      ))}
    </div>
  );
}

function ProductDetail() {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const { addToCart, getCartItem } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState('');
  const [editHoverRating, setEditHoverRating] = useState(0);
  const [activeImage, setActiveImage] = useState(0);

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

  useEffect(() => {
    if (product) {
      const cartItem = getCartItem(product._id);
      if (cartItem) {
        setQuantity(cartItem.quantity);
      }
    }
  }, [product, getCartItem]);

  useEffect(() => {
    if (!product?.photos || product.photos.length <= 1) return;
    const interval = setInterval(() => {
      setActiveImage((prev) => (prev + 1) % product.photos.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [product?.photos]);

  const handleAddToCart = () => {
    if (product.stock === 0) return;
    if (!currentUser) {
      navigate('/login', { state: { from: location.pathname + location.search } });
      return;
    }
    addToCart(product, parseInt(quantity));
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:5000/api/products/${id}/reviews/${reviewId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        setProduct((prevProduct) => ({
          ...prevProduct,
          reviews: prevProduct.reviews.filter((r) => r._id !== reviewId),
          numReviews: data.numReviews,
          rating: data.rating,
        }));
        alert('Review deleted successfully');
      } else {
        throw new Error(data.message || 'Failed to delete review');
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEditReview = (review) => {
    setEditingReviewId(review._id);
    setEditRating(review.rating);
    setEditComment(review.comment);
  };

  const handleCancelEdit = () => {
    setEditingReviewId(null);
    setEditRating(0);
    setEditComment('');
    setEditHoverRating(0);
  };

  const handleUpdateReview = async (reviewId) => {
    if (editRating === 0) {
      alert('Please select a star rating.');
      return;
    }

    if (!editComment.trim()) {
      alert('Please enter a comment.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/reviews/${reviewId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rating: editRating,
          comment: editComment,
          productId: id,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setProduct((prevProduct) => ({
          ...prevProduct,
          reviews: prevProduct.reviews.map((r) =>
            r._id === reviewId
              ? {
                  ...r,
                  rating: data.review.rating,
                  comment: data.review.comment,
                  createdAt: data.review.createdAt,
                }
              : r
          ),
          numReviews: data.numReviews,
          rating: data.productRating,
        }));
        handleCancelEdit();
        alert('Review updated successfully');
      } else {
        throw new Error(data.message || 'Failed to update review');
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const isReviewOwner = (review) => {
    if (!currentUser) return false;
    const reviewUserId = review.user._id || review.user.id || review.user;
    return reviewUserId.toString() === currentUser.id.toString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">
        Loading...
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">
        {error || 'Product not found'}
      </div>
    );
  }

  const photos = product.photos || [];
  const activePhoto = photos[activeImage];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gray-900 text-white py-12 px-4 sm:px-8 shadow-2xl">
        <div className="max-w-6xl mx-auto space-y-4">
          <p className="text-sm uppercase tracking-[0.4em] text-orange-400/80">RunMate • Product</p>
          <h1 className="text-4xl sm:text-5xl font-black">
            {product.name}{' '}
            <span className="text-orange-400">
              {product.category ? `· ${product.category}` : ''}
            </span>
          </h1>
          <p className="text-gray-300 max-w-3xl">{product.description}</p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        <Link
          to="/products"
          className="inline-flex items-center text-sm font-semibold text-gray-600 hover:text-orange-500"
        >
          ← Back to products
        </Link>

        <div className="grid gap-10 lg:grid-cols-[3fr,2fr]">
          <div className="space-y-4">
            <div className="relative rounded-3xl bg-white shadow-lg border border-gray-100 h-[420px] overflow-hidden">
              {activePhoto ? (
                <>
                  <img
                    key={activePhoto}
                    src={activePhoto}
                    alt={product.name}
                    className="w-full h-full object-cover transition-opacity duration-500"
                  />
                  {photos.length > 1 && (
                    <>
                      <button
                        onClick={() =>
                          setActiveImage((prev) => (prev === 0 ? photos.length - 1 : prev - 1))
                        }
                        className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 backdrop-blur px-3 py-2 text-sm font-bold text-gray-900 shadow hover:bg-white"
                      >
                        ‹
                      </button>
                      <button
                        onClick={() => setActiveImage((prev) => (prev + 1) % photos.length)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 backdrop-blur px-3 py-2 text-sm font-bold text-gray-900 shadow hover:bg-white"
                      >
                        ›
                      </button>
                      <div className="absolute bottom-4 inset-x-0 flex justify-center gap-2">
                        {photos.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setActiveImage(index)}
                            className={`h-2 w-2 rounded-full ${
                              index === activeImage ? 'bg-orange-500' : 'bg-white/60'
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No image
                </div>
              )}
            </div>

            {photos.length > 1 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {photos.map((photo, idx) => (
                  <button
                    key={photo}
                    onClick={() => setActiveImage(idx)}
                    className={`rounded-2xl border-2 overflow-hidden ${
                      idx === activeImage ? 'border-orange-500' : 'border-transparent'
                    }`}
                  >
                    <img src={photo} alt={`${product.name} ${idx + 1}`} className="h-24 w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl bg-white shadow-xl border border-gray-100 p-8 space-y-5">
              <div className="flex items-center gap-2">
                <StarRatingDisplay rating={product.rating} />
                <span className="text-sm text-gray-500">
                  ({product.numReviews} review{product.numReviews !== 1 ? 's' : ''})
                </span>
              </div>
              <div className="flex items-baseline gap-3">
                <p className="text-4xl font-black text-gray-900">${product.price}</p>
                <span
                  className={`text-sm font-semibold ${
                    product.stock > 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                </span>
              </div>

              {currentUser && currentUser.id === product.createdBy?._id ? (
                <Link
                  to={`/products/${product._id}/edit`}
                  className="inline-flex items-center justify-center rounded-2xl border border-orange-200 bg-orange-50 px-5 py-3 text-sm font-semibold text-orange-600 hover:bg-orange-100 transition"
                >
                  Edit product
                </Link>
              ) : (
                <div className="flex flex-col gap-3">
                  <label className="text-sm font-semibold text-gray-700">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    max={product.stock}
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(
                        Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1))
                      )
                    }
                    className="w-32 rounded-2xl border border-gray-200 px-4 py-2 text-lg font-semibold text-center shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                  />
                  <button
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                    className="rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-200 transition hover:from-orange-600 hover:to-orange-700 disabled:opacity-60"
                  >
                    {addedToCart ? 'Added to cart!' : product.stock === 0 ? 'Out of stock' : 'Add to cart'}
                  </button>
                </div>
              )}
            </div>

            <div className="rounded-3xl bg-white shadow-lg border border-gray-100 p-8 space-y-4 text-gray-700">
              <p className="font-semibold text-gray-900">About this product</p>
              <p>{product.description}</p>
            </div>
          </div>
        </div>

        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>
          {product.reviews && product.reviews.length > 0 ? (
            <div className="space-y-4">
              {product.reviews.map((review) => (
                <div key={review._id} className="rounded-3xl bg-white border border-gray-100 shadow p-6">
                  {editingReviewId === review._id ? (
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-semibold text-gray-700">Your rating *</label>
                        <div className="flex gap-2 mt-2 text-2xl">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span
                              key={star}
                              className={
                                star <= (editHoverRating || editRating)
                                  ? 'text-orange-500 cursor-pointer'
                                  : 'text-gray-300 cursor-pointer'
                              }
                              onClick={() => setEditRating(star)}
                              onMouseEnter={() => setEditHoverRating(star)}
                              onMouseLeave={() => setEditHoverRating(0)}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-gray-700">Your comment</label>
                        <textarea
                          rows="4"
                          value={editComment}
                          onChange={(e) => setEditComment(e.target.value)}
                          className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                          placeholder="Share your thoughts on the product..."
                        />
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleUpdateReview(review._id)}
                          className="rounded-2xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 transition"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="rounded-2xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {review.user.name || review.user.email || 'User'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <StarRatingDisplay rating={review.rating} />
                      </div>
                      <p className="mt-3 text-gray-700">{review.comment}</p>
                      {currentUser && (isReviewOwner(review) || currentUser.isAdmin) && (
                        <div className="mt-4 flex gap-3">
                          {isReviewOwner(review) && (
                            <button
                              className="text-sm font-semibold text-orange-600 hover:text-orange-700"
                              onClick={() => handleEditReview(review)}
                            >
                              Edit Review
                            </button>
                          )}
                          <button
                            className="text-sm font-semibold text-red-600 hover:text-red-700"
                            onClick={() => handleDeleteReview(review._id)}
                          >
                            Delete Review
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No reviews for this product yet.</p>
          )}
        </section>
      </main>
    </div>
  );
}

export default ProductDetail;