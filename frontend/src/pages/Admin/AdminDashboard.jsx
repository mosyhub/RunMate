import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/Sidebar';
import SalesChart from './SalesChart';

const API_URL = 'http://localhost:5000/api/admin';

function AdminDashboard() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    if (!currentUser.isAdmin) {
      navigate('/products');
      return;
    }

    fetchDashboardData();
  }, [currentUser]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setStats(data.stats);
        setRecentOrders(data.recentOrders || []);
        setRecentUsers(data.recentUsers || []);
      } else {
        setError(data.message || 'Failed to fetch dashboard data');
      }
    } catch (err) {
      setError('Error loading dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'text-yellow-600',
      processing: 'text-blue-600',
      shipped: 'text-purple-600',
      delivered: 'text-green-600',
      cancelled: 'text-red-600'
    };
    return colors[status] || 'text-gray-600';
  };

  const renderShell = (content) => (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 pt-20 md:pt-0 flex items-center justify-center text-gray-500">
        {content}
      </div>
    </div>
  );

  if (loading) {
    return renderShell('Loading dashboard...');
  }

  if (error) {
    return renderShell(error);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 pt-20 md:pt-0">
        <header className="bg-gray-900 text-white py-16 px-4 sm:px-8 shadow-2xl">
          <div className="max-w-7xl mx-auto flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-4">
              <p className="text-sm uppercase tracking-[0.4em] text-orange-400/80">Admin • Dashboard</p>
              <h1 className="text-4xl sm:text-5xl font-black tracking-tight">
                Keep the <span className="text-orange-400">RunMate</span> engine running.
              </h1>
              <p className="text-lg text-gray-300 max-w-3xl">
                Pulled straight from the home page aesthetic—bold, confident, and ready for a sprint through your latest stats.
              </p>
            </div>
            <button
              onClick={logout}
              className="inline-flex items-center justify-center rounded-2xl border border-white/20 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10 transition"
            >
              Logout
            </button>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl bg-white shadow-lg border border-gray-100 p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Total Users</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{stats?.totalUsers || 0}</p>
            </div>
            <div className="rounded-2xl bg-white shadow-lg border border-gray-100 p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Total Orders</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{stats?.totalOrders || 0}</p>
            </div>
            <div className="rounded-2xl bg-white shadow-lg border border-gray-100 p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Total Products</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{stats?.totalProducts || 0}</p>
            </div>
            <div className="rounded-2xl bg-white shadow-lg border border-gray-100 p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Total Revenue</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">${(stats?.totalRevenue || 0).toFixed(2)}</p>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl bg-white border border-gray-100 shadow-xl p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
                <p className="text-sm text-gray-500">{recentOrders.length} latest</p>
              </div>
              {recentOrders.length === 0 ? (
                <p className="text-center py-10 text-gray-500 text-sm">No orders found.</p>
              ) : (
                <div className="mt-4 overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-100 text-sm">
                    <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-widest text-gray-500">
                      <tr>
                        <th className="px-4 py-3 text-left">Order</th>
                        <th className="px-4 py-3 text-left">Customer</th>
                        <th className="px-4 py-3 text-left">Total</th>
                        <th className="px-4 py-3 text-left">Status</th>
                        <th className="px-4 py-3 text-left">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-gray-700">
                      {recentOrders.map((order) => (
                        <tr key={order._id}>
                          <td className="px-4 py-4 font-semibold text-gray-900">#{order._id.slice(-8)}</td>
                          <td className="px-4 py-4">{order.user?.name || order.user?.email || 'N/A'}</td>
                          <td className="px-4 py-4">${order.totalAmount.toFixed(2)}</td>
                          <td className={`px-4 py-4 capitalize font-semibold ${getStatusColor(order.status)}`}>
                            {order.status}
                          </td>
                          <td className="px-4 py-4">{new Date(order.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="rounded-3xl bg-white border border-gray-100 shadow-xl p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">New Users</h2>
                <p className="text-sm text-gray-500">{recentUsers.length} joined</p>
              </div>
              {recentUsers.length === 0 ? (
                <p className="text-center py-10 text-gray-500 text-sm">No users found.</p>
              ) : (
                <div className="mt-4 overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-100 text-sm">
                    <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-widest text-gray-500">
                      <tr>
                        <th className="px-4 py-3 text-left">Name</th>
                        <th className="px-4 py-3 text-left">Email</th>
                        <th className="px-4 py-3 text-left">Role</th>
                        <th className="px-4 py-3 text-left">Joined</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-gray-700">
                      {recentUsers.map((user) => (
                        <tr key={user._id}>
                          <td className="px-4 py-4 font-semibold text-gray-900">{user.name || 'N/A'}</td>
                          <td className="px-4 py-4">{user.email}</td>
                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                                user.isAdmin ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {user.isAdmin ? 'Admin' : 'User'}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>

          <section className="rounded-3xl bg-white border border-gray-100 shadow-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Sales Performance</h2>
              <p className="text-sm text-gray-500">Last 12 months</p>
            </div>
            <SalesChart />
          </section>
        </main>
      </div>
    </div>
  );
}

export default AdminDashboard;
