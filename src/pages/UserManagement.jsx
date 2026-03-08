import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { getAllUsers, createUser, deleteUser } from '../services/api';
import "../App.css"
const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    role: 'USER'
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await getAllUsers();
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    try {
      await createUser(formData);
      setShowModal(false);
      setFormData({ username: '', password: '', email: '', role: 'USER' });
      fetchUsers();
    } catch (error) {
      setErrors({ submit: error.response?.data?.message || 'Erreur lors de la création' });
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur?')) {
      try {
        await deleteUser(userId);
        fetchUsers();
      } catch (error) {
        alert('Erreur lors de la suppression');
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      
      <div className="container">
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1 className="card-header">Gestion des utilisateurs</h1>
            <button 
              className="btn btn-primary"
              onClick={() => setShowModal(true)}
            >
              + Nouvel utilisateur
            </button>
          </div>
          
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nom d'utilisateur</th>
                  <th>Email</th>
                  <th>Rôle</th>
                  <th>Statut</th>
                  <th>Date de création</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.username}</td>
                    <td>{user.email || '-'}</td>
                    <td>
                      <span className={`badge ${user.role === 'ADMIN' ? 'badge-accepted' : 'badge-pending'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${user.enabled ? 'badge-accepted' : 'badge-rejected'}`}>
                        {user.enabled ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td>{formatDate(user.createdAt)}</td>
                    <td>
                      <button
                        className="btn btn-danger"
                        style={{ padding: '5px 10px', fontSize: '14px' }}
                        onClick={() => handleDelete(user.id)}
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal for creating user */}
        {showModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}>
            <div className="card" style={{ maxWidth: '500px', margin: '20px', width: '100%' }}>
              <h2>Créer un nouvel utilisateur</h2>
              
              {errors.submit && (
                <div className="alert alert-error" style={{ marginTop: '15px' }}>
                  {errors.submit}
                </div>
              )}
              
              <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
                <div className="form-group">
                  <label className="form-label">Nom d'utilisateur *</label>
                  <input
                    type="text"
                    name="username"
                    className="form-input"
                    value={formData.username}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Mot de passe *</label>
                  <input
                    type="password"
                    name="password"
                    className="form-input"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength="6"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    name="email"
                    className="form-input"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Rôle *</label>
                  <select
                    name="role"
                    className="form-select"
                    value={formData.role}
                    onChange={handleChange}
                    required
                  >
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
                
                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                  <button type="submit" className="btn btn-primary">
                    Créer
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowModal(false);
                      setFormData({ username: '', password: '', email: '', role: 'USER' });
                      setErrors({});
                    }}
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
