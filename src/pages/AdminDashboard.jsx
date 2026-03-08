import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { getAllCredits, updateCreditStatus, getStatistics } from '../services/api';
import { useNavigate } from 'react-router-dom';
import "../App.css"
const AdminDashboard = () => {
  const [credits, setCredits] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCredit, setSelectedCredit] = useState(null);
  const [commentaire, setCommentaire] = useState('');
const navigate = useNavigate();
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [creditsRes, statsRes] = await Promise.all([
        getAllCredits(),
        getStatistics()
      ]);
      setCredits(creditsRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (creditId, newStatus) => {
    try {
      await updateCreditStatus(creditId, {
        statut: newStatus,
        commentaire: commentaire
      });
      setSelectedCredit(null);
      setCommentaire('');
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Erreur lors de la mise à jour du statut');
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
        {/* Statistics */}
        {stats && (
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{stats.total}</div>
              <div className="stat-label">Total des demandes</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ color: '#f39c12' }}>{stats.enAttente}</div>
              <div className="stat-label">En attente</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ color: '#27ae60' }}>{stats.accepte}</div>
              <div className="stat-label">Acceptées</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ color: '#e74c3c' }}>{stats.refuse}</div>
              <div className="stat-label">Refusées</div>
            </div>
          </div>
        )}

        {/* Credits Table */}
        <div className="card">
          <h1 className="card-header">Toutes les demandes de crédit</h1>
          
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Agent</th>
                  <th>Client</th>
                  <th>CIN</th>
                  <th>Téléphone</th>
                  <th>Montant</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {credits.map((credit) => (
                  <tr key={credit.id} onClick={() => navigate(`/credits/${credit.id}`)} style={{ cursor: "pointer" }}>
                    <td>{formatDate(credit.dateDemande)}</td>
                    <td>{credit.user.username}</td>
                    <td>{credit.client.nom} {credit.client.prenom}</td>
                    <td>***</td>
                    <td>{credit.client.telephone}</td>
                    <td>{formatCurrency(credit.montant)}</td>
                    <td>{getStatusBadge(credit.statut)}</td>
                    <td>
                      {credit.statut === 'EN_ATTENTE' ? (
                        <button
                          className="btn btn-primary"
                          style={{ padding: '5px 10px', fontSize: '14px' }}
                          onClick={() => setSelectedCredit(credit)}
                        >
                          Traiter
                        </button>
                      ) : (
                        <span style={{ fontSize: '14px', color: '#718096' }}>
                          {credit.traitePar?.username}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal for status update */}
        {selectedCredit && (
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
            <div className="card" style={{ maxWidth: '500px', margin: '20px' }}>
              <h2>Traiter la demande</h2>
              <p style={{ marginTop: '10px' }}>
                <strong>Client:</strong> {selectedCredit.client.nom} {selectedCredit.client.prenom}
              </p>
              <p><strong>Montant:</strong> {formatCurrency(selectedCredit.montant)}</p>
              
              <div className="form-group" style={{ marginTop: '20px' }}>
                <label className="form-label">Commentaire</label>
                <textarea
                  className="form-textarea"
                  value={commentaire}
                  onChange={(e) => setCommentaire(e.target.value)}
                  placeholder="Ajouter un commentaire (optionnel)"
                />
              </div>
              
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button
                  className="btn btn-success"
                  onClick={() => handleStatusUpdate(selectedCredit.id, 'ACCEPTE')}
                >
                  ✓ Accepter
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => handleStatusUpdate(selectedCredit.id, 'REFUSE')}
                >
                  ✗ Refuser
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setSelectedCredit(null);
                    setCommentaire('');
                  }}
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
