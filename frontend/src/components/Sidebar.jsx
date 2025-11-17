import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_LINKS = [
  { label: 'Dashboard', to: '/admin' },
  { label: 'Products', to: '/admin/products' },
  { label: 'Orders', to: '/admin/orders' },
  { label: 'Reviews', to: '/admin/reviews' },
  { label: 'Users', to: '/admin/users' },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="md:w-72 flex-shrink-0">
      {/* Mobile nav */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-gray-900 text-white shadow-lg">
        <div className="px-4 py-3">
          <p className="text-xs uppercase tracking-[0.4em] text-orange-400/80">RunMate</p>
          <div className="flex items-center justify-between">
            <p className="text-xl font-black">Admin</p>
            <button
              onClick={handleLogout}
              className="text-xs font-semibold uppercase tracking-widest text-gray-300 hover:text-white"
            >
              Logout
            </button>
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto px-4 pb-3">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold ${
                isActive(link.to)
                  ? 'bg-orange-500 text-white'
                  : 'bg-white/10 text-gray-200'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:flex-col min-h-screen bg-gray-950 text-white sticky top-0">
        <div className="px-6 py-8 border-b border-white/10">
          <p className="text-xs uppercase tracking-[0.4em] text-orange-400/80">RunMate</p>
          <p className="mt-2 text-2xl font-black tracking-tight">Admin Control</p>
          <p className="mt-1 text-sm text-gray-400">{currentUser?.email}</p>
        </div>
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                isActive(link.to)
                  ? 'bg-orange-500/20 text-white border border-orange-400/40'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {link.label}
              {isActive(link.to) && <span className="text-orange-400">•</span>}
            </Link>
          ))}
        </nav>
        <div className="px-4 pb-6">
          <button
            onClick={handleLogout}
            className="w-full rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-gray-200 hover:bg-white/10 transition"
          >
            Logout
          </button>
        </div>
      </aside>
    </div>
  );
}