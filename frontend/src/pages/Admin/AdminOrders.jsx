import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/Sidebar';

const API_URL = 'http://localhost:5000/api/admin';

function AdminOrders() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    if (!currentUser.isAdmin) {
      navigate('/products');
      return;
    }

    fetchOrders();
  }, [currentUser, statusFilter, page]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      });
      if (statusFilter) params.append('status', statusFilter);

      const response = await fetch(`${API_URL}/orders?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setOrders(data.orders);
        setTotalPages(data.pages);
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
      setUpdatingOrderId(orderId);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/orders/${orderId}`, {
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
        alert(data.message || 'Failed to update order status');
      }
    } catch (err) {
      alert('Error updating order status');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handlePaymentStatusUpdate = async (orderId, newPaymentStatus) => {
    try {
      setUpdatingOrderId(orderId);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ paymentStatus: newPaymentStatus })
      });

      const data = await response.json();

      if (data.success) {
        fetchOrders();
      } else {
        alert(data.message || 'Failed to update payment status');
      }
    } catch (err) {
      alert('Error updating payment status');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleDelete = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      return;
    }

    try {
      setUpdatingOrderId(orderId);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        fetchOrders();
        alert('Order deleted successfully');
      } else {
        alert(data.message || 'Failed to delete order');
      }
    } catch (err) {
      alert('Error deleting order');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const statusBadge = {
    pending: 'bg-yellow-100 text-yellow-700',
    processing: 'bg-blue-100 text-blue-700',
    shipped: 'bg-indigo-100 text-indigo-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  const paymentBadge = {
    pending: 'bg-yellow-100 text-yellow-700',
    paid: 'bg-emerald-100 text-emerald-700',
    failed: 'bg-red-100 text-red-700',
    refunded: 'bg-gray-200 text-gray-700',
  };

  const renderShell = (content) => (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 pt-20 md:pt-0 flex items-center justify-center text-gray-500">
        {content}
      </div>
    </div>
  );

  if (loading && orders.length === 0) {
    return renderShell('Loading orders...');
  }

  if (error && orders.length === 0) {
    return renderShell(error);
  }

  const pageRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const pendingCount = orders.filter((o) => o.status === 'pending').length;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 pt-20 md:pt-0">
        <header className="bg-gray-900 text-white py-16 px-4 sm:px-8 shadow-2xl">
          <div className="max-w-7xl mx-auto space-y-6">
            <p className="text-sm uppercase tracking-[0.4em] text-orange-400/80">Admin • Orders</p>
            <h1 className="text-4xl sm:text-5xl font-black">
              Command center for every <span className="text-orange-400">RunMate shipment</span>.
            </h1>
            <p className="text-lg text-gray-300 max-w-3xl">
              Styled after the home page hero so it feels cohesive—scan health, resolve issues, and keep fulfillment on pace.
            </p>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl bg-white border border-gray-100 shadow p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Orders (page)</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{orders.length}</p>
            </div>
            <div className="rounded-2xl bg-white border border-gray-100 shadow p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Pending</p>
              <p className="mt-2 text-3xl font-bold text-yellow-600">{pendingCount}</p>
            </div>
            <div className="rounded-2xl bg-white border border-gray-100 shadow p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Revenue (page)</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">${pageRevenue.toFixed(2)}</p>
            </div>
            <div className="rounded-2xl bg-white border border-gray-100 shadow p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Filter</p>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </section>

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <section className="rounded-3xl bg-white border border-gray-100 shadow-xl p-6">
            {orders.length === 0 ? (
              <p className="text-center py-10 text-gray-500 text-sm">No orders found.</p>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-100 text-sm">
                    <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-widest text-gray-500">
                      <tr>
                        <th className="px-4 py-3 text-left">Order</th>
                        <th className="px-4 py-3 text-left">Customer</th>
                        <th className="px-4 py-3 text-left">Items</th>
                        <th className="px-4 py-3 text-left">Total</th>
                        <th className="px-4 py-3 text-left">Status</th>
                        <th className="px-4 py-3 text-left">Payment</th>
                        <th className="px-4 py-3 text-left">Date</th>
                        <th className="px-4 py-3 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-gray-700">
                      {orders.map((order) => (
                        <tr key={order._id}>
                          <td className="px-4 py-4 font-semibold text-gray-900">
                            <Link to={`/orders/${order._id}`} className="text-orange-600 hover:underline">
                              #{order._id.slice(-8)}
                            </Link>
                          </td>
                          <td className="px-4 py-4">{order.user?.name || order.user?.email || 'N/A'}</td>
                          <td className="px-4 py-4">{order.items.length} item(s)</td>
                          <td className="px-4 py-4 font-semibold text-gray-900">${order.totalAmount.toFixed(2)}</td>
                          <td className="px-4 py-4">
                            <select
                              value={order.status}
                              onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                              className={`w-full rounded-full border border-transparent px-3 py-1 text-xs font-semibold ${statusBadge[order.status] || 'bg-gray-100 text-gray-600'}`}
                              disabled={updatingOrderId === order._id}
                            >
                              <option value="pending">Pending</option>
                              <option value="processing">Processing</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td className="px-4 py-4">
                            <select
                              value={order.paymentStatus}
                              onChange={(e) => handlePaymentStatusUpdate(order._id, e.target.value)}
                              className={`w-full rounded-full border border-transparent px-3 py-1 text-xs font-semibold ${paymentBadge[order.paymentStatus] || 'bg-gray-100 text-gray-600'}`}
                              disabled={updatingOrderId === order._id}
                            >
                              <option value="pending">Pending</option>
                              <option value="paid">Paid</option>
                              <option value="failed">Failed</option>
                              <option value="refunded">Refunded</option>
                            </select>
                          </td>
                          <td className="px-4 py-4">{new Date(order.createdAt).toLocaleDateString()}</td>
                          <td className="px-4 py-4">
                            <div className="flex flex-wrap gap-2">
                              <Link
                                to={`/orders/${order._id}`}
                                className="rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
                              >
                                View
                              </Link>
                              <button
                                onClick={() => handleDelete(order._id)}
                                disabled={updatingOrderId === order._id}
                                className="rounded-xl border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition disabled:opacity-50"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm font-semibold text-gray-700">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="rounded-full border border-gray-200 px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span>
                      Page {page} of {totalPages}
                    </span>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="rounded-full border border-gray-200 px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

export default AdminOrders;

