import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";

const CreditDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [credit, setCredit] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`http://localhost:8080/api/credits/${id}`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
        }
    })
    .then(response => {
        setCredit(response.data);
        setLoading(false);
    })
    .catch(error => {
        console.error("Erreur chargement:", error);
        setLoading(false);
    });
  }, [id]);

  const getStatusBadge = (status) => {
    const statusClasses = {
        'EN_ATTENTE': 'pending',
        'ACCEPTE': 'approved',
        'REFUSE': 'rejected'
    };
    const statusLabels = {
        'EN_ATTENTE': 'En attente',
        'ACCEPTE': 'Accepté',
        'REFUSE': 'Refusé'
    };
    return (
        <span className={`status-badge ${statusClasses[status] || ''}`}>
            {statusLabels[status] || status}
        </span>
    );
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
        <div className="credit-details">
            <Navbar />
            <div className="container">
                <div className="skeleton-title"></div>
                <div className="details-grid">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="detail-card">
                            <div className="card-header">
                                <div className="skeleton-text" style={{width: '60%'}}></div>
                            </div>
                            <div className="card-body">
                                <div className="skeleton-text"></div>
                                <div className="skeleton-text"></div>
                                <div className="skeleton-text"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
  }

  if (!credit) {
    return (
        <div className="credit-details">
            <Navbar />
            <div className="container">
                <div className="alert alert-error">
                    Crédit introuvable
                </div>
            </div>
        </div>
    );
  }

  return (
    <div className="credit-details">
      <Navbar />
      
      {/* En-tête de page */}
      <div className="page-header">
        <div className="container">
          <h1 className="page-title">
            Détails du crédit #{credit.id}
          </h1>
          <div className="page-actions">
            <button 
              className="btn btn-secondary"
              onClick={() => navigate(-1)}
            >
              ← Retour
            </button>
            {credit.statut === 'EN_ATTENTE' && (
              <button className="btn btn-primary">
                Traiter la demande
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="container">
        {/* Grille principale */}
        <div className="details-grid">
          {/* Informations client */}
          <div className="detail-card">
            <div className="card-header">
              <div className="card-header-icon">👤</div>
              <h3>Informations client</h3>
            </div>
            <div className="card-body">
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Nom complet</span>
                  <span className="info-value">
                    {credit.client.nom} {credit.client.prenom}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Téléphone</span>
                  <span className="info-value">{credit.client.telephone}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Adresse</span>
                  <span className="info-value">{credit.client.adresse || 'Non renseignée'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Statut</span>
                  <span className="info-value">{getStatusBadge(credit.statut)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Informations crédit */}
          <div className="detail-card">
            <div className="card-header">
              <div className="card-header-icon">💰</div>
              <h3>Détails du crédit</h3>
            </div>
            <div className="card-body">
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Montant demandé</span>
                  <span className="info-value highlight">
                    {formatCurrency(credit.montant)}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Date de demande</span>
                  <span className="info-value">{formatDate(credit.dateDemande)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scoring IA */}
        <div className="detail-card" style={{marginBottom: '1.5rem'}}>
          <div className="card-header">
            <div className="card-header-icon">🤖</div>
            <h3>Analyse IA</h3>
          </div>
          <div className="card-body">
            <div className="score-card">
              <div className="score-header">
                <div className="score-icon">🎯</div>
                <div className="score-title">Score de crédit</div>
              </div>
              <div className="score-value">{credit.scoreIA}/1000</div>
              <div className="score-decision">
                Décision IA : {credit.decisionIA || 'En attente'}
              </div>
            </div>

            <table className="data-table">
              <tbody>
                <tr>
                  <td>Âge</td>
                  <td>{credit.personAge} ans</td>
                </tr>
                <tr>
                  <td>Expérience professionnelle</td>
                  <td>{credit.personEmpLength} ans</td>
                </tr>
                <tr>
                  <td>Revenu annuel</td>
                  <td>{formatCurrency(credit.personIncome)}</td>
                </tr>
                <tr>
                  <td>Type de logement</td>
                  <td>{credit.personHomeOwnership}</td>
                </tr>
                <tr>
                  <td>Titre d'emploi</td>
                  <td>{credit.personEmpTitle}</td>
                </tr>
                <tr>
                  <td>Objectif du prêt</td>
                  <td>{credit.loanIntent}</td>
                </tr>
                <tr>
                  <td>Grade du prêt</td>
                  <td>{credit.loanGrade}</td>
                </tr>
                <tr>
                  <td>Défaut de paiement</td>
                  <td>{credit.cbPersonDefaultOnFile}</td>
                </tr>
                <tr>
                  <td>Historique de crédit</td>
                  <td>{credit.cbPersonCredHistLength} ans</td>
                </tr>
                <tr>
                  <td>Ratio prêt/revenu</td>
                  <td>{credit.loanPercentIncome}%</td>
                </tr>
                <tr>
                  <td>Taux d'intérêt</td>
                  <td>{credit.loanIntRate}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Timeline */}
        <div className="timeline">
          <h3 style={{marginBottom: '1rem'}}>Historique de la demande</h3>
          <div className="timeline-item">
            <div className="timeline-dot"></div>
            <div className="timeline-content">
              <div className="timeline-date">{formatDate(credit.dateDemande)}</div>
              <div className="timeline-title">Demande créée</div>
              <div className="timeline-description">
                Par {credit.user?.username || 'Système'}
              </div>
            </div>
          </div>
          {credit.traitePar && (
            <div className="timeline-item">
              <div className="timeline-dot"></div>
              <div className="timeline-content">
                <div className="timeline-date">{formatDate(credit.dateTraitement)}</div>
                <div className="timeline-title">Demande traitée</div>
                <div className="timeline-description">
                  Par {credit.traitePar.username} - {getStatusBadge(credit.statut)}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreditDetails;