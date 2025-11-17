import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/Sidebar';

const API_URL = 'http://localhost:5000/api/admin';

function AdminProducts() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [stockUpdatingId, setStockUpdatingId] = useState(null);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    if (!currentUser.isAdmin) {
      navigate('/products');
      return;
    }

    fetchProducts();
  }, [currentUser, search, category, page]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12'
      });
      if (category) params.append('category', category);
      if (search) params.append('search', search);

      const response = await fetch(`${API_URL}/products?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setProducts(data.products);
        setTotalPages(data.pages);
        setError('');
      } else {
        setError(data.message || 'Failed to fetch products');
      }
    } catch (err) {
      setError('Error loading products');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        fetchProducts();
        alert('Product deleted successfully');
      } else {
        alert(data.message || 'Failed to delete product');
      }
    } catch (err) {
      alert('Error deleting product');
    }
  };

  const toggleSelectProduct = (id) => {
    setSelectedProducts((prev) =>
      prev.includes(id) ? prev.filter((productId) => productId !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map((product) => product._id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) return;
    if (
      !window.confirm(
        `Are you sure you want to delete ${selectedProducts.length} selected product${
          selectedProducts.length > 1 ? 's' : ''
        }?`
      )
    ) {
      return;
    }

    try {
      setBulkDeleting(true);
      const token = localStorage.getItem('token');

      for (const id of selectedProducts) {
        await fetch(`http://localhost:5000/api/products/${id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      }

      setSelectedProducts([]);
      fetchProducts();
      alert('Selected products deleted successfully');
    } catch (err) {
      alert('An error occurred while deleting selected products');
    } finally {
      setBulkDeleting(false);
    }
  };

  const handleAddStock = async (product) => {
    const input = window.prompt(`Add stock to "${product.name}"`, '1');
    if (input === null) return;
    const amount = Number(input);
    if (Number.isNaN(amount) || amount <= 0) {
      alert('Please enter a positive number.');
      return;
    }

    try {
      setStockUpdatingId(product._id);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/products/${product._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ stock: (product.stock || 0) + amount }),
      });

      const data = await response.json();
      if (data.success) {
        fetchProducts();
      } else {
        alert(data.message || 'Failed to update stock');
      }
    } catch (err) {
      alert('Error updating stock');
    } finally {
      setStockUpdatingId(null);
    }
  };

  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-600">
        Loading products...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 pt-20 md:pt-0">
        <header className="bg-gray-900 text-white py-16 px-4 sm:px-8 shadow-2xl">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col gap-4">
            <p className="text-sm uppercase tracking-[0.4em] text-orange-400/80">Admin • Products</p>
            <h1 className="text-4xl sm:text-5xl font-black">
              Keep the <span className="text-orange-400">RunMate inventory</span> ready to run.
            </h1>
            <p className="text-lg text-gray-300 max-w-3xl">
              Inspired by the home page hero—bold, legible, and purposeful. Highlight low stock, repair negative counts, and stay in control.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-white/10 border border-white/20 p-4 text-center">
              <p className="text-xs uppercase tracking-[0.3em] text-gray-300">Total Products</p>
              <p className="mt-2 text-3xl font-bold">{products.length}</p>
            </div>
            <div className="rounded-2xl bg-white/10 border border-white/20 p-4 text-center">
              <p className="text-xs uppercase tracking-[0.3em] text-gray-300">Low Stock (&lt;5)</p>
              <p className="mt-2 text-3xl font-bold text-yellow-200">
                {products.filter((p) => (p.stock ?? 0) < 5).length}
              </p>
            </div>
            <div className="rounded-2xl bg-white/10 border border-white/20 p-4 text-center">
              <p className="text-xs uppercase tracking-[0.3em] text-gray-300">Negative Stock</p>
              <p className="mt-2 text-3xl font-bold text-red-200">
                {products.filter((p) => (p.stock ?? 0) < 0).length}
              </p>
            </div>
          </div>
        </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <section className="rounded-3xl bg-white border border-gray-100 shadow-xl p-6 space-y-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:flex-wrap">
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full sm:w-64 rounded-2xl border border-gray-200 px-4 py-3 text-sm shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
              />
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setPage(1);
                }}
                className="w-full sm:w-56 rounded-2xl border border-gray-200 px-4 py-3 text-sm shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-200 bg-white"
              >
                <option value="">All Categories</option>
                <option value="lsd">Long Slow Distance</option>
                <option value="daily">Daily Trainers</option>
                <option value="tempo">Tempo Shoes</option>
                <option value="super">Super Shoes</option>
                <option value="sports">Sports</option>
              </select>
            </div>
            <div className="flex flex-wrap gap-3">
              {products.length > 0 && (
                <button
                  className="rounded-2xl border border-red-200 px-5 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 transition disabled:opacity-50"
                  disabled={selectedProducts.length === 0 || bulkDeleting}
                  onClick={handleBulkDelete}
                >
                  {bulkDeleting ? 'Deleting...' : `Delete Selected (${selectedProducts.length})`}
                </button>
              )}
              <Link
                to="/admin/products/new"
                className="inline-flex items-center rounded-2xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white shadow hover:bg-black/80 transition"
              >
                + Create Product
              </Link>
            </div>
          </div>

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
        </section>

        <section className="rounded-3xl bg-white border border-gray-100 shadow-xl p-6">
          {products.length === 0 ? (
            <div className="text-center py-10 text-gray-500 text-sm">No products found.</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100 text-sm">
                  <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-widest text-gray-500">
                    <tr>
                      <th className="px-4 py-3">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                          checked={selectedProducts.length === products.length && products.length > 0}
                          onChange={toggleSelectAll}
                        />
                      </th>
                      <th className="px-4 py-3 text-left">Product</th>
                      <th className="px-4 py-3 text-left">Details</th>
                      <th className="px-4 py-3 text-left">Category</th>
                      <th className="px-4 py-3 text-left">Price</th>
                      <th className="px-4 py-3 text-left">Stock</th>
                      <th className="px-4 py-3 text-left">Created By</th>
                      <th className="px-4 py-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {products.map((product) => (
                      <tr key={product._id} className="hover:bg-gray-50/60">
                        <td className="px-4 py-4 align-top">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                            checked={selectedProducts.includes(product._id)}
                            onChange={() => toggleSelectProduct(product._id)}
                          />
                        </td>
                        <td className="px-4 py-4 align-top">
                          <div className="flex items-center gap-3">
                            {product.photos && product.photos.length > 0 ? (
                              <img
                                src={product.photos[0]}
                                alt={product.name}
                                className="h-16 w-16 rounded-2xl object-cover bg-gray-100"
                              />
                            ) : (
                              <div className="h-16 w-16 rounded-2xl bg-gray-100 flex items-center justify-center text-xs text-gray-500">
                                No Image
                              </div>
                            )}
                            <div>
                              <p className="font-semibold text-gray-900">{product.name}</p>
                              <p className="text-xs text-gray-500">ID: {product._id.slice(-8)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 align-top text-sm text-gray-600">
                          {product.description?.substring(0, 110)}
                          {product.description?.length > 110 ? '...' : ''}
                        </td>
                        <td className="px-4 py-4 align-top">{product.category || 'N/A'}</td>
                        <td className="px-4 py-4 align-top font-semibold text-gray-900">
                          ${product.price?.toFixed(2)}
                        </td>
                        <td className="px-4 py-4 align-top">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                              (product.stock ?? 0) < 0
                                ? 'bg-red-100 text-red-700'
                                : (product.stock ?? 0) < 5
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-green-100 text-green-700'
                            }`}
                          >
                            {product.stock}
                          </span>
                        </td>
                        <td className="px-4 py-4 align-top">
                          {product.createdBy?.name || product.createdBy?.email || 'N/A'}
                        </td>
                        <td className="px-4 py-4 align-top">
                          <div className="flex flex-col gap-2">
                            <button
                              onClick={() => handleAddStock(product)}
                              disabled={stockUpdatingId === product._id}
                              className="rounded-xl border border-orange-200 px-3 py-2 text-xs font-semibold text-orange-600 hover:bg-orange-50 transition disabled:opacity-50"
                            >
                              {stockUpdatingId === product._id ? 'Updating...' : 'Add Stock'}
                            </button>
                            <Link
                              to={`/admin/products/${product._id}/edit`}
                              className="rounded-xl border border-blue-200 px-3 py-2 text-xs font-semibold text-blue-600 text-center hover:bg-blue-50 transition"
                            >
                              Edit
                            </Link>
                            <button
                              onClick={() => handleDelete(product._id)}
                              className="rounded-xl border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition"
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

export default AdminProducts;

