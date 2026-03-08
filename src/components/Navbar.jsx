import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import "../App.css"
const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        🏦 Gestion des Crédits
      </div>
      
      <div className="navbar-menu">
        <Link to="/dashboard" className="navbar-link">
          Tableau de bord
        </Link>
        
        {!isAdmin() && (
          <Link to="/credit/new" className="navbar-link">
            Nouvelle demande
          </Link>
        )}
        
        {isAdmin() && (
          <>
            <Link to="/admin/users" className="navbar-link">
              Utilisateurs
            </Link>
            <Link to="/admin/credits" className="navbar-link">
              Toutes les demandes
            </Link>
          </>
        )}
        
        <div className="navbar-user">
          <span>👤 {user?.username}</span>
          <span className="badge badge-primary">{user?.role}</span>
          <button onClick={handleLogout} className="btn btn-secondary">
            Déconnexion
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
