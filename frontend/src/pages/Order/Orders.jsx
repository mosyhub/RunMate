import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const API_URL = 'http://localhost:5000/api/orders';

function Orders() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);

      const response = await fetch(`${API_URL}?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setOrders(data.orders);
      } else {
        setError(data.message || 'Failed to fetch orders');
      }
    } catch (err) {
      setError('Error loading orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();

      if (data.success) {
        fetchOrders();
      } else {
        alert(data.message || 'Failed to update order');
      }
    } catch (err) {
      alert('Error updating order');
    }
  };

  const handleDelete = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this order?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/${orderId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        fetchOrders();
      } else {
        alert(data.message || 'Failed to delete order');
      }
    } catch (err) {
      alert('Error deleting order');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gray-900 text-white py-16 px-4 sm:px-8 shadow-2xl">
        <div className="max-w-6xl mx-auto flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.4em] text-orange-400/80">Order Center</p>
            <h1 className="text-4xl sm:text-5xl font-black">
              Track every <span className="text-orange-400">RunMate order</span>.
            </h1>
            <p className="mt-3 text-lg text-gray-300 max-w-2xl">
              Same bold palette as the home page, so your purchase history feels cohesive with the rest of the experience.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 justify-end">
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-2xl border border-orange-400 px-5 py-2.5 text-sm font-semibold text-orange-400 hover:bg-orange-500 hover:text-white transition"
            >
              ← Back to Home
            </Link>
            <Link
              to="/orders/new"
              className="inline-flex items-center rounded-2xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-orange-600 transition"
            >
              Create New Order
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 flex flex-wrap items-center gap-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-64 rounded-2xl border border-gray-200 px-4 py-3 text-sm shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-200 bg-white"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-20 text-gray-600">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="text-center rounded-3xl border border-gray-100 bg-white p-10 shadow">
            <p className="text-lg font-semibold text-gray-800">No orders found</p>
            <p className="mt-2 text-sm text-gray-500">Start your running journey with a new purchase.</p>
            <Link
              to="/orders/new"
              className="mt-6 inline-flex items-center rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:bg-orange-600 transition"
            >
              Create Your First Order
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order._id} className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xl">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Order</p>
                    <h3 className="text-2xl font-bold text-gray-900">#{order._id.slice(-8)}</h3>
                    <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full px-4 py-1.5 text-sm font-semibold capitalize ${
                      order.status === 'delivered'
                        ? 'bg-green-100 text-green-700'
                        : order.status === 'cancelled'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-orange-100 text-orange-700'
                    }`}
                  >
                    {order.status}
                  </span>
                </div>

                <div className="mt-6 space-y-4">
                  <p className="text-sm font-semibold uppercase tracking-widest text-gray-500">Items</p>
                  {order.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-2xl border border-gray-100 bg-gray-50/60 p-4"
                    >
                      {item.product?.photos?.[0] && (
                        <img
                          src={item.product.photos[0]}
                          alt={item.product?.name || item.productName || 'Product'}
                          className="h-20 w-20 rounded-2xl object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <p className="text-base font-semibold text-gray-900">
                          {item.product?.name || item.productName || 'Product'}
                        </p>
                        <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                        <p className="text-sm text-gray-500">${item.price} each</p>
                      </div>
                      {order.status === 'delivered' && (
                        <Link
                          to={`/review?productId=${item.product?._id}&orderId=${order._id}&itemId=${item._id}`}
                          className="inline-flex rounded-xl border border-orange-200 px-4 py-2 text-sm font-semibold text-orange-600 hover:bg-orange-50 transition"
                        >
                          Review
                        </Link>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-gray-100 pt-4">
                  <p className="text-lg font-bold text-gray-900">
                    Total: ${order.totalAmount.toFixed(2)}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Link
                      to={`/orders/${order._id}`}
                      className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
                    >
                      View Details
                    </Link>
                    {order.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleStatusUpdate(order._id, 'cancelled')}
                          className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 transition"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleDelete(order._id)}
                          className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 transition"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Orders;

