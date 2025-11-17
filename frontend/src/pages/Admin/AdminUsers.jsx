import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/Sidebar';

const API_URL = 'http://localhost:5000/api/admin';

function AdminUsers() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    isAdmin: false
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    if (!currentUser.isAdmin) {
      navigate('/products');
      return;
    }

    fetchUsers();
  }, [currentUser, search, page]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      });
      if (search) params.append('search', search);

      const response = await fetch(`${API_URL}/users?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setUsers(data.users);
        setTotalPages(data.pages);
        setError('');
      } else {
        setError(data.message || 'Failed to fetch users');
      }
    } catch (err) {
      setError('Error loading users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setCreating(true);
      // Use signup endpoint to create user (public endpoint, no auth needed)
      const response = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();

      if (data.success) {
        // If admin checkbox was checked, update the user using admin endpoint
        if (formData.isAdmin) {
          const token = localStorage.getItem('token');
          await fetch(`${API_URL}/users/${data.user.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ isAdmin: true })
          });
        }
        setShowCreateForm(false);
        setFormData({ name: '', email: '', password: '', isAdmin: false });
        fetchUsers();
        alert('User created successfully');
      } else {
        alert(data.message || 'Failed to create user');
      }
    } catch (err) {
      alert('Error creating user');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    if (userId === currentUser.id) {
      alert('Cannot delete your own account');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        fetchUsers();
        alert('User deleted successfully');
      } else {
        alert(data.message || 'Failed to delete user');
      }
    } catch (err) {
      alert('Error deleting user');
    }
  };

  const totalAdmins = users.filter((user) => user.isAdmin).length;
  const totalMembers = users.length;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 pt-20 md:pt-0">
        <header className="bg-gray-900 text-white py-16 px-4 sm:px-8 shadow-2xl">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex flex-col gap-4">
            <p className="text-sm uppercase tracking-[0.4em] text-orange-400/80">Admin • Users</p>
            <h1 className="text-4xl sm:text-5xl font-black">
              Keep your <span className="text-orange-400">RunMate community</span> in sync.
            </h1>
            <p className="text-lg text-gray-300 max-w-3xl">
              Inspired by the home page hero—bold gradients, confident typography, and zero clutter while you manage members.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-white/10 border border-white/20 p-4 text-center">
              <p className="text-xs uppercase tracking-[0.3em] text-gray-300">Total Users</p>
              <p className="mt-2 text-3xl font-bold">{totalMembers}</p>
            </div>
            <div className="rounded-2xl bg-white/10 border border-white/20 p-4 text-center">
              <p className="text-xs uppercase tracking-[0.3em] text-gray-300">Admins</p>
              <p className="mt-2 text-3xl font-bold text-orange-300">{totalAdmins}</p>
            </div>
          </div>
        </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <section className="rounded-3xl bg-white border border-gray-100 shadow-xl p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full lg:max-w-sm rounded-2xl border border-gray-200 px-4 py-3 text-sm shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
            />
            <button
              onClick={() => setShowCreateForm((prev) => !prev)}
              className="inline-flex items-center justify-center rounded-2xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white shadow hover:bg-black/80 transition"
            >
              {showCreateForm ? 'Close Form' : 'Create User'}
            </button>
          </div>

          {error && (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {showCreateForm && (
            <form onSubmit={handleCreate} className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <label className="text-sm font-semibold text-gray-700">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                />
              </div>
              <div className="sm:col-span-1">
                <label className="text-sm font-semibold text-gray-700">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700">Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={6}
                  className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                />
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isAdmin"
                  checked={formData.isAdmin}
                  onChange={(e) => setFormData({ ...formData, isAdmin: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                />
                <label htmlFor="isAdmin" className="text-sm font-semibold text-gray-700">
                  Admin User
                </label>
              </div>
              <div className="sm:col-span-2 flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={creating}
                  className="rounded-2xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white shadow hover:bg-orange-600 transition disabled:opacity-60"
                >
                  {creating ? 'Creating...' : 'Create User'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="rounded-2xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </section>

        <section className="rounded-3xl bg-white border border-gray-100 shadow-xl p-6">
          {loading && users.length === 0 ? (
            <div className="text-center py-10 text-gray-500 text-sm">Loading users...</div>
          ) : users.length === 0 ? (
            <div className="text-center py-10 text-gray-500 text-sm">No users found.</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100 text-sm">
                  <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-widest text-gray-500">
                    <tr>
                      <th className="px-4 py-3 text-left">Name</th>
                      <th className="px-4 py-3 text-left">Email</th>
                      <th className="px-4 py-3 text-left">Role</th>
                      <th className="px-4 py-3 text-left">Joined</th>
                      <th className="px-4 py-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {users.map((user) => (
                      <tr key={user._id || user.id}>
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
                        <td className="px-4 py-4">
                          <button
                            onClick={() => handleDelete(user._id || user.id)}
                            className="rounded-full border border-red-200 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-red-600 hover:bg-red-50 transition disabled:opacity-50"
                            disabled={user._id === currentUser?.id || user.id === currentUser?.id}
                          >
                            Delete
                          </button>
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

export default AdminUsers;

