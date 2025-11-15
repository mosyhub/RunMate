import { Link, useLocation } from "react-router-dom";
import '../css/Sidebar.css';

export default function Sidebar() {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="sidebar">
      <h1 className="sidebar-title">Admin Panel</h1>
      <nav className="sidebar-nav">
        <Link 
          to="/admin" 
          className={`sidebar-link ${isActive('/admin') ? 'active' : ''}`}
        >
          Dashboard
        </Link>
        <Link 
          to="/products" 
          className={`sidebar-link ${isActive('/products') ? 'active' : ''}`}
        >
          Products
        </Link>
        <Link 
          to="/orders" 
          className={`sidebar-link ${isActive('/orders') ? 'active' : ''}`}
        >
          Orders
        </Link>
        <Link 
          to="/admin/users" 
          className={`sidebar-link ${isActive('/admin/users') ? 'active' : ''}`}
        >
          Users
        </Link>
        <Link 
          to="/products/new" 
          className={`sidebar-link ${isActive('/products/new') ? 'active' : ''}`}
        >
          Add Product
        </Link>
      </nav>
    </div>
  );
}
