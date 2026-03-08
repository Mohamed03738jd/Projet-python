import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getUserCredits } from '../services/api';
import { useAuth } from '../context/AuthContext';
import "../App.css"
const UserDashboard = () => {
  const [credits, setCredits] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchCredits();
  }, []);

  const fetchCredits = async () => {
    try {
      const response = await getUserCredits();
      setCredits(response.data);
    } catch (error) {
      console.error('Error fetching credits:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      EN_ATTENTE: 'badge-pending',
      ACCEPTE: 'badge-accepted',
      REFUSE: 'badge-rejected'
    };
    
    const labels = {
      EN_ATTENTE: 'En attente',
      ACCEPTE: 'Accepté',
      REFUSE: 'Refusé'
    };
    
    return <span className={`badge ${badges[status]}`}>{labels[status]}</span>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD'
    }).format(amount);
  };

  return (
    <div>
      <Navbar />
      
      <div className="container">
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1 className="card-header">Bienvenue, {user?.username}!</h1>
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/credit/new')}
            >
              + Nouvelle demande
            </button>
          </div>
          
          <h2 style={{ marginTop: '30px', marginBottom: '20px', fontSize: '20px' }}>
            Mes demandes de crédit
          </h2>
          
          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
            </div>
          ) : credits.length === 0 ? (
            <div className="alert alert-info">
              Vous n'avez pas encore de demande de crédit. Cliquez sur "Nouvelle demande" pour commencer.
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Client</th>
                    <th>Montant</th>
                    <th>Statut</th>
                    <th>Commentaire</th>
                  </tr>
                </thead>
                <tbody>
                  {credits.map((credit) => (
                      <tr key={credit.id} onClick={() => navigate(`/credits/${credit.id}`)} style={{ cursor: "pointer" }}>
                      <td>{formatDate(credit.dateDemande)}</td>
                      <td>{credit.client.nom} {credit.client.prenom}</td>
                      <td>{formatCurrency(credit.montant)}</td>
                      <td>{getStatusBadge(credit.statut)}</td>
                      <td>{credit.commentaire || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
