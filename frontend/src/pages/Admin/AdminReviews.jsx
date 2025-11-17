import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';

// Helper component para sa stars
function StarRatingDisplay({ rating }) {
  return (
    <div className="flex gap-1 text-base">
      {[1, 2, 3, 4, 5].map((value) => (
        <span
          key={value}
          className={value <= rating ? 'text-orange-500' : 'text-gray-300'}
        >
          ★
        </span>
      ))}
    </div>
  );
}

function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/reviews', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();

      if (data.success) {
        setReviews(data.reviews);
      } else {
        throw new Error(data.message || 'Failed to fetch reviews');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId, reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      // Ito 'yung EXISTING delete route na ginawa natin dati
      const response = await fetch(`http://localhost:5000/api/products/${productId}/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        // Tanggalin ang review sa state
        setReviews(prevReviews => prevReviews.filter(r => r._id !== reviewId));
        alert('Review deleted');
      } else {
        throw new Error(data.message || 'Failed to delete review');
      }

    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 pt-20 md:pt-0">
        <header className="bg-gray-900 text-white py-16 px-4 sm:px-8 shadow-2xl">
          <div className="max-w-6xl mx-auto space-y-6">
            <p className="text-sm uppercase tracking-[0.4em] text-orange-400/80">Admin • Reviews</p>
            <h1 className="text-4xl sm:text-5xl font-black">
              Keep the <span className="text-orange-400">RunMate voice</span> constructive.
            </h1>
            <p className="text-lg text-gray-300 max-w-3xl">
              Styled like the home hero so moderation feels native—spot praise, flag issues, and keep the community authentic.
            </p>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {loading && <div className="text-center py-10 text-gray-500 text-sm">Loading reviews...</div>}
          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 mb-6">
              {error}
            </div>
          )}

          {!loading && !error && (
            <div className="rounded-3xl bg-white border border-gray-100 shadow-xl p-6">
              {reviews.length === 0 ? (
                <p className="text-center py-10 text-gray-500 text-sm">No reviews found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-100 text-sm">
                    <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-widest text-gray-500">
                      <tr>
                        <th className="px-4 py-3 text-left">Date</th>
                        <th className="px-4 py-3 text-left">User</th>
                        <th className="px-4 py-3 text-left">Product</th>
                        <th className="px-4 py-3 text-left">Rating</th>
                        <th className="px-4 py-3 text-left">Comment</th>
                        <th className="px-4 py-3 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-gray-700">
                      {reviews.map((review) => (
                        <tr key={review._id}>
                          <td className="px-4 py-4">{new Date(review.createdAt).toLocaleDateString()}</td>
                        <td className="px-4 py-4 font-semibold text-gray-900">
                          {review.user?.name || review.user?.email || 'Unknown'}
                        </td>
                          <td className="px-4 py-4">{review.productName}</td>
                          <td className="px-4 py-4">
                            <StarRatingDisplay rating={review.rating} />
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-600">{review.comment}</td>
                          <td className="px-4 py-4">
                            <button
                              className="rounded-full border border-red-200 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition"
                              onClick={() => handleDelete(review.productId, review._id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default AdminReviews;