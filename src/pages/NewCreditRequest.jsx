import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { createCreditRequest } from '../services/api';
import "../App.css"
const NewCreditRequest = () => {
  const [formData, setFormData] = useState({
  nom: '',
  prenom: '',
  cin: '',
  salaire: '',
  adresse: '',
  telephone: '',
  montant: '',
  personAge: '',
  personEmpLength: '',
  personIncome: '',
  personHomeOwnership: '',
  personEmpTitle: '',
  loanIntent: '',
  loanGrade: '',
  cbPersonDefaultOnFile: '',
  cbPersonCredHistLength: '',
  loanIntRate: ''
});

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {

    const newErrors = {};
    
    if (!formData.nom.trim()) newErrors.nom = 'Le nom est requis';
    if (!formData.prenom.trim()) newErrors.prenom = 'Le prénom est requis';
    if (!formData.cin.trim()) newErrors.cin = 'Le CIN est requis';
    if (!formData.salaire || formData.salaire <= 0) newErrors.salaire = 'Le salaire doit être supérieur à 0';
    if (!formData.telephone.trim()) newErrors.telephone = 'Le téléphone est requis';
    if (!/^[0-9]{10}$/.test(formData.telephone)) newErrors.telephone = 'Le téléphone doit contenir 10 chiffres';
    if (!formData.montant || formData.montant < 1000) newErrors.montant = 'Le montant doit être au moins 1000 MAD';
    if (!formData.personAge) newErrors.personAge = 'Age requis';
    if (!formData.personEmpLength) newErrors.personEmpLength = 'Expérience requise';
    if (!formData.personIncome) newErrors.personIncome = 'Revenu requis';
    if (parseFloat(formData.personIncome) <= 0) {
        newErrors.personIncome = "Revenu invalide";
      }
    if (!formData.personHomeOwnership) newErrors.personHomeOwnership = 'Home ownership requis';
    if (!formData.loanIntent) newErrors.loanIntent = 'Loan intent requis';
    if (!formData.loanGrade) newErrors.loanGrade = 'Loan grade requis';
    if (!formData.cbPersonDefaultOnFile) newErrors.cbPersonDefaultOnFile = 'Champ requis';
    if (!formData.personEmpTitle.trim()) newErrors.personEmpTitle = 'Titre emploi requis';
    if (!formData.cbPersonCredHistLength) newErrors.cbPersonCredHistLength = 'Historique crédit requis';
    if (!formData.loanIntRate) newErrors.loanIntRate = 'Taux intérêt requis';
    if (!formData.personAge) {
        newErrors.personAge = 'Age requis';
      } else if (parseInt(formData.personAge) < 18) {
        newErrors.personAge = 'Age minimum 18';
      }
    if (formData.personEmpLength < 0) newErrors.personEmpLength = 'Expérience invalide';
    if (formData.loanIntRate <= 0) newErrors.loanIntRate = 'Taux invalide';

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setLoading(true);
    const loanPercentIncome =
     parseFloat(formData.montant) / parseFloat(formData.personIncome);
    try {
      await createCreditRequest({
      ...formData,
      salaire: parseFloat(formData.salaire),
      montant: parseFloat(formData.montant),
      personAge: parseInt(formData.personAge),
      personEmpLength: parseInt(formData.personEmpLength),
      personIncome: parseFloat(formData.personIncome),
      cbPersonCredHistLength: parseFloat(formData.cbPersonCredHistLength),
      loanPercentIncome: loanPercentIncome,
      loanIntRate: parseFloat(formData.loanIntRate)
    });

      
      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      setErrors({ submit: error.response?.data?.message || 'Erreur lors de la création de la demande' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      
      <div className="container">
        <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 className="card-header">Nouvelle demande de crédit</h1>
          
          {success && (
            <div className="alert alert-success">
              Demande créée avec succès! Redirection...
            </div>
          )}
          
          {errors.submit && (
            <div className="alert alert-error">
              {errors.submit}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <h3 style={{ marginBottom: '20px', color: '#667eea' }}>Informations du client</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="form-group">
                <label className="form-label">Nom *</label>
                <input
                  type="text"
                  name="nom"
                  className="form-input"
                  value={formData.nom}
                  onChange={handleChange}
                  required
                />
                {errors.nom && <div className="form-error">{errors.nom}</div>}
              </div>
              
              <div className="form-group">
                <label className="form-label">Prénom *</label>
                <input
                  type="text"
                  name="prenom"
                  className="form-input"
                  value={formData.prenom}
                  onChange={handleChange}
                  required
                />
                {errors.prenom && <div className="form-error">{errors.prenom}</div>}
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="form-group">
                <label className="form-label">CIN *</label>
                <input
                  type="text"
                  name="cin"
                  className="form-input"
                  value={formData.cin}
                  onChange={handleChange}
                  required
                />
                {errors.cin && <div className="form-error">{errors.cin}</div>}
              </div>
              
              <div className="form-group">
                <label className="form-label">Salaire (MAD) *</label>
                <input
                  type="number"
                  name="salaire"
                  className="form-input"
                  value={formData.salaire}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  required
                />
                {errors.salaire && <div className="form-error">{errors.salaire}</div>}
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">Adresse</label>
              <textarea
                name="adresse"
                className="form-textarea"
                value={formData.adresse}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Téléphone *</label>
              <input
                type="tel"
                name="telephone"
                className="form-input"
                value={formData.telephone}
                onChange={handleChange}
                placeholder="0612345678"
                required
              />
              {errors.telephone && <div className="form-error">{errors.telephone}</div>}
            </div>
            
            <h3 style={{ marginTop: '30px', marginBottom: '20px', color: '#667eea' }}>Détails du crédit</h3>
            
            <div className="form-group">
              <label className="form-label">Montant demandé (MAD) *</label>
              <input
                type="number"
                name="montant"
                className="form-input"
                value={formData.montant}
                onChange={handleChange}
                min="1000"
                step="0.01"
                required
              />
              {errors.montant && <div className="form-error">{errors.montant}</div>}
            </div>
            <h3 style={{ marginTop: '30px', color: '#667eea' }}>
  Données Scoring IA
</h3>
<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
  <div className="form-group">
    <label>Âge *</label>
    <input type="number" name="personAge" className="form-input"
      value={formData.personAge} onChange={handleChange} required />
  </div>

  <div className="form-group">
    <label>Années d'expérience *</label>
    <input type="number" name="personEmpLength" className="form-input"
      value={formData.personEmpLength} onChange={handleChange} required />
  </div>
</div>
<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
    <div className="form-group">
      <label>Revenu annuel *</label>
      <input type="number" name="personIncome" className="form-input"
        value={formData.personIncome} onChange={handleChange} required />
    </div>

    <div className="form-group">
      <label>Home Ownership *</label>
      <select name="personHomeOwnership"
        value={formData.personHomeOwnership}
        onChange={handleChange}
        className="form-input"
        required>
        <option value="">Select</option>
        <option value="RENT">RENT</option>
        <option value="OWN">OWN</option>
        <option value="MORTGAGE">MORTGAGE</option>
      </select>
    </div>
</div>
<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
    <div className="form-group">
      <label>Titre emploi *</label>
      <input type="text" name="personEmpTitle"
        className="form-input"
        value={formData.personEmpTitle}
        onChange={handleChange}
        required />
    </div>

    <div className="form-group">
      <label>Loan Intent *</label>
      <input type="text" name="loanIntent"
        className="form-input"
        value={formData.loanIntent}
        onChange={handleChange}
        required />
    </div>
</div>
<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
    <div className="form-group">
      <label>Loan Grade *</label>
      <input type="text" name="loanGrade"
        className="form-input"
        value={formData.loanGrade}
        onChange={handleChange}
        required />
    </div>

    <div className="form-group">
      <label>Default On File *</label>
      <select name="cbPersonDefaultOnFile"
        value={formData.cbPersonDefaultOnFile}
        onChange={handleChange}
        className="form-input"
        required>
        <option value="">Select</option>
        <option value="Y">Y</option>
        <option value="N">N</option>
      </select>
    </div>
</div>
<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
    <div className="form-group">
      <label>Credit History Length *</label>
      <input type="number" step="0.1"
        name="cbPersonCredHistLength"
        className="form-input"
        value={formData.cbPersonCredHistLength}
        onChange={handleChange}
        required />
    </div>


    <div className="form-group">
      <label>Taux intérêt *</label>
      <input type="number" step="0.01"
        name="loanIntRate"
        className="form-input"
        value={formData.loanIntRate}
        onChange={handleChange}
        required />
    </div>
</div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '30px' , justifyContent:'center'}}>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Envoi en cours...' : 'Soumettre la demande'}
              </button>
              
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => navigate('/dashboard')}
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewCreditRequest;
