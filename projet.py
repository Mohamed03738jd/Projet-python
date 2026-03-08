# ================================
# CREDIT SCORING PROJECT — FULL PIPELINE CLEAN + CLASS BALANCE + MULTIPLE METRICS
# ================================

#  1) Import des librairies
import joblib
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import roc_auc_score, classification_report, confusion_matrix, accuracy_score, f1_score
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
import warnings
warnings.filterwarnings('ignore')

#  1.1) Import SHAP
import shap

#  2) Charger le dataset
df = pd.read_csv("credit_risk_dataset.csv")
print("Shape initial:", df.shape)

#  3)  NETTOYAGE MÉTIER AVANT EDA
print("\nValeurs nulles avant nettoyage:\n", df.isnull().sum())

# Supprimer lignes avec valeurs nulles
df = df.dropna()
print("Shape après suppression des null:", df.shape)

# Règle métier : âge >= expérience
df = df[df['person_age'] >= df['person_emp_length']]
print("Shape après règle age >= emp_length:", df.shape)

# Supprimer valeurs aberrantes
df = df[(df['person_age'] > 18) & (df['person_age'] < 80)]
df = df[df['person_emp_length'] >= 0]
df = df[df['loan_amnt'] > 0]
print("Nombre final de lignes après nettoyage:", len(df))

#  3.1)  ÉQUILIBRAGE DES CLASSES (50% / 50%)
y = df['loan_status']
X = df.drop('loan_status', axis=1)

df_majority = df[df['loan_status'] == 0]
df_minority = df[df['loan_status'] == 1]

print("\nAvant équilibrage:")
print(df['loan_status'].value_counts())

# Échantillonnage de la classe majoritaire pour équilibrer
df_majority_balanced = df_majority.sample(len(df_minority), random_state=42)

# Fusion et mélange
df_balanced = pd.concat([df_majority_balanced, df_minority])
df_balanced = df_balanced.sample(
    frac=1, random_state=42).reset_index(drop=True)

print("\nAprès équilibrage:")
print(df_balanced['loan_status'].value_counts())

# Remplacer df par le dataset équilibré
df = df_balanced

#  4) EDA
print("\nInfo dataset:\n")
print(df.info())

sns.countplot(x='loan_status', data=df)
plt.title("Distribution du Target (loan_status) après équilibrage")
plt.show()

#  5) Séparer TARGET
y = df['loan_status']
X = df.drop('loan_status', axis=1)

#  6) Identifier numériques / catégoriques
num_features = X.select_dtypes(include=['int64', 'float64']).columns.tolist()
cat_features = X.select_dtypes(include=['object']).columns.tolist()

print("Num features:", num_features)
print("Cat features:", cat_features)

#  7) Preprocessing PIPELINE (ANTI DATA LEAKAGE)
num_pipeline = Pipeline([
    ('imputer', SimpleImputer(strategy='median')),
    ('scaler', StandardScaler())
])

cat_pipeline = Pipeline([
    ('imputer', SimpleImputer(strategy='most_frequent')),
    ('encoder', OneHotEncoder(drop='first', handle_unknown='ignore', sparse_output=False))
])

preprocessor = ColumnTransformer([
    ('num', num_pipeline, num_features),
    ('cat', cat_pipeline, cat_features)
])

#  8) Train / Test Split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

#  9) Définir modèles
models = {
    "Logistic Regression": LogisticRegression(max_iter=1000),
    "Decision Tree": DecisionTreeClassifier(),
    "Random Forest": RandomForestClassifier(n_estimators=200, random_state=42),
    "Gradient Boosting": GradientBoostingClassifier()
}

#  10) Entraîner, valider (cross-val) et comparer ROC-AUC, Accuracy, F1
results = {}

for name, model in models.items():
    pipe = Pipeline([
        ('preprocessor', preprocessor),
        ('classifier', model)
    ])

    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

    # Cross-validation
    auc_scores = cross_val_score(
        pipe, X_train, y_train, cv=cv, scoring='roc_auc')
    acc_scores = cross_val_score(
        pipe, X_train, y_train, cv=cv, scoring='accuracy')
    f1_scores = cross_val_score(pipe, X_train, y_train, cv=cv, scoring='f1')

    # Entraînement complet
    pipe.fit(X_train, y_train)

    # Prédictions test
    y_pred = pipe.predict(X_test)
    y_prob = pipe.predict_proba(X_test)[:, 1]

    # Métriques test
    auc_test = roc_auc_score(y_test, y_prob)
    acc_test = accuracy_score(y_test, y_pred)
    f1_test = f1_score(y_test, y_pred)

    results[name] = {
        "AUC": auc_test,
        "Accuracy": acc_test,
        "F1": f1_test,
        "Pipeline": pipe
    }

    print(f"\n {name}")
    print(f"ROC-AUC (CV mean): {auc_scores.mean():.4f} | Test: {auc_test:.4f}")
    print(
        f"Accuracy (CV mean): {acc_scores.mean():.4f} | Test: {acc_test:.4f}")
    print(f"F1-score (CV mean): {f1_scores.mean():.4f} | Test: {f1_test:.4f}")

#  11) Choisir le meilleur modèle selon ROC-AUC
best_model_name = max(results, key=lambda x: results[x]["AUC"])
best_pipe = results[best_model_name]["Pipeline"]

print("\n Meilleur modèle basé sur ROC-AUC :", best_model_name)
print("AUC:", results[best_model_name]["AUC"])
print("Accuracy:", results[best_model_name]["Accuracy"])
print("F1-score:", results[best_model_name]["F1"])

#  12) Évaluation finale
y_pred = best_pipe.predict(X_test)

print("\nClassification Report:\n")
print(classification_report(y_test, y_pred))

cm = confusion_matrix(y_test, y_pred)
sns.heatmap(cm, annot=True, fmt='d')
plt.title("Confusion Matrix")
plt.show()

#  13) Interprétabilité (feature importance / coefficients)
classifier = best_pipe.named_steps['classifier']

if hasattr(classifier, "feature_importances_"):
    ohe = best_pipe.named_steps['preprocessor'].named_transformers_[
        'cat'].named_steps['encoder']
    encoded_cat = ohe.get_feature_names_out(cat_features)
    all_features = num_features + list(encoded_cat)

    importances = pd.Series(
        classifier.feature_importances_, index=all_features)
    importances.sort_values(ascending=False).head(
        10).plot(kind='bar', figsize=(10, 6))
    plt.title("Top 10 Features Importantes")
    plt.show()

elif hasattr(classifier, "coef_"):
    ohe = best_pipe.named_steps['preprocessor'].named_transformers_[
        'cat'].named_steps['encoder']
    encoded_cat = ohe.get_feature_names_out(cat_features)
    all_features = num_features + list(encoded_cat)

    coefs = pd.Series(classifier.coef_[0], index=all_features)
    coefs.sort_values(ascending=False).head(
        10).plot(kind='bar', figsize=(10, 6))
    plt.title("Top 10 Coefficients (Logistic Regression)")
    plt.show()

else:
    print("Ce modèle ne supporte pas l'interprétabilité directe (feature_importances_ / coef_).")

#  13.1)  ANALYSE SHAP
print("\n" + "="*60)
print(" ANALYSE SHAP - INTERPRÉTABILITÉ AVANCÉE")
print("="*60)

# Transformer les données de test
X_test_transformed = best_pipe.named_steps['preprocessor'].transform(X_test)

# Récupérer les noms de features après transformation
ohe = best_pipe.named_steps['preprocessor'].named_transformers_['cat'].named_steps['encoder']
encoded_cat = ohe.get_feature_names_out(cat_features)
all_features = num_features + list(encoded_cat)

# Créer DataFrame avec les features transformées
X_test_df = pd.DataFrame(X_test_transformed, columns=all_features)

# Initialiser l'explainer SHAP selon le type de modèle
print("\n Initialisation de l'explainer SHAP...")

if best_model_name in ["Random Forest", "Gradient Boosting", "Decision Tree"]:
    # Pour les modèles à base d'arbres
    explainer = shap.TreeExplainer(classifier)
    shap_values = explainer.shap_values(X_test_df)
    
    # Si shap_values est une liste (pour classification binaire), prendre classe 1
    if isinstance(shap_values, list):
        shap_values = shap_values[1]
    
elif best_model_name == "Logistic Regression":
    # Pour la régression logistique
    explainer = shap.LinearExplainer(classifier, X_test_df)
    shap_values = explainer.shap_values(X_test_df)

else:
    # Pour les autres modèles, utiliser KernelExplainer (plus lent)
    # Échantillonner 100 exemples pour accélérer
    background = shap.sample(X_test_df, 100)
    explainer = shap.KernelExplainer(classifier.predict_proba, background)
    shap_values = explainer.shap_values(X_test_df)
    if isinstance(shap_values, list):
        shap_values = shap_values[1]

print(" Calcul des valeurs SHAP terminé!")

#  VISUALISATION 1: Summary Plot (vue d'ensemble)
print("\n Génération du Summary Plot...")
plt.figure()
shap.summary_plot(shap_values, X_test_df, plot_type="bar", show=False)
plt.title(f"SHAP - Importance des Features ({best_model_name})")
plt.tight_layout()
plt.show()

#  VISUALISATION 2: Summary Plot détaillé (avec impact directionnel)
print("\n Génération du Summary Plot détaillé...")
plt.figure()
shap.summary_plot(shap_values, X_test_df, show=False)
plt.title(f"SHAP - Impact des Features ({best_model_name})")
plt.tight_layout()
plt.show()

#  VISUALISATION 3: Dependence Plot pour les top 3 features
print("\n Génération des Dependence Plots (Top 3 features)...")
try:
    feature_importance = np.abs(shap_values).mean(axis=0)
    top_features_idx = np.argsort(feature_importance)[-3:][::-1]
    
    for i, idx in enumerate(top_features_idx):
        idx_int = int(idx)  # Convertir en entier
        feature_name = all_features[idx_int]
        plt.figure(figsize=(10, 6))
        shap.dependence_plot(
            idx_int,
            shap_values,
            X_test_df,
            feature_names=all_features,
            show=False
        )
        plt.title(f"SHAP Dependence Plot - {feature_name} ({best_model_name})")
        plt.tight_layout()
        plt.show()
    print(" Dependence Plots générés avec succès!")
except Exception as e:
    print(f" Dependence Plots non générés: {e}")

print("\n Analyse SHAP terminée avec succès!")
print("="*60)

#  14) Sauvegarder le modèle complet (pipeline + classifieur)
joblib.dump(best_pipe, 'credit_model.pkl')
print("\n Modèle sauvegardé dans 'credit_model.pkl' !")

#  15)  TEST D'UN NOUVEAU CLIENT AVEC EXPLICATIONS SHAP
print("\n" + "="*60)
print(" TEST NOUVEAU CLIENT - PRÉDICTION + EXPLICATIONS")
print("="*60)

# Exemple de nouveau client à tester
nouveau_client = pd.DataFrame({
    'person_age': [35],
    'person_income': [50000],
    'person_home_ownership': ['RENT'],
    'person_emp_length': [5.0],
    'loan_intent': ['PERSONAL'],
    'loan_grade': ['C'],
    'loan_amnt': [10000],
    'loan_int_rate': [12.5],
    'loan_percent_income': [0.20],
    'cb_person_default_on_file': ['N'],
    'cb_person_cred_hist_length': [8]
})

print("\n Informations du nouveau client:")
print(nouveau_client.T)

# Prédiction
prediction = best_pipe.predict(nouveau_client)[0]
prediction_proba = best_pipe.predict_proba(nouveau_client)[0]

print("\n" + "="*60)
if prediction == 1:
    print(" DÉCISION: PRÊT REFUSÉ")
    print(f" Probabilité de défaut: {prediction_proba[1]*100:.2f}%")
    print(f" Probabilité de remboursement: {prediction_proba[0]*100:.2f}%")
else:
    print(" DÉCISION: PRÊT APPROUVÉ")
    print(f" Probabilité de remboursement: {prediction_proba[0]*100:.2f}%")
    print(f" Probabilité de défaut: {prediction_proba[1]*100:.2f}%")
print("="*60)

# Transformer le nouveau client pour SHAP
nouveau_client_transformed = best_pipe.named_steps['preprocessor'].transform(nouveau_client)
nouveau_client_df = pd.DataFrame(nouveau_client_transformed, columns=all_features)

# Calculer les valeurs SHAP pour ce client
print("\n Calcul des explications SHAP pour ce client...")
client_shap_values = explainer.shap_values(nouveau_client_df)

# Si liste (classification binaire), prendre classe 1 (défaut)
if isinstance(client_shap_values, list):
    client_shap_values = client_shap_values[1]

# Récupérer l'expected_value
if isinstance(explainer.expected_value, np.ndarray):
    expected_val = explainer.expected_value[1] if len(explainer.expected_value) > 1 else explainer.expected_value[0]
else:
    expected_val = explainer.expected_value

print(" Explications calculées!")

#  EXPLICATION 1: Tableau des contributions
print("\n" + "="*60)
print(" TOP 10 FACTEURS QUI INFLUENCENT LA DÉCISION")
print("="*60)

# Créer un DataFrame avec les contributions
contributions = pd.DataFrame({
    'Feature': all_features,
    'Valeur': nouveau_client_df.iloc[0].values,
    'Impact_SHAP': client_shap_values[0]
})

# Trier par impact absolu
contributions['Impact_Absolu'] = np.abs(contributions['Impact_SHAP'])
contributions = contributions.sort_values('Impact_Absolu', ascending=False)

# Afficher les top 10
print("\n🔝 Les 10 facteurs les plus influents:")
print("-" * 60)
for idx, row in contributions.head(10).iterrows():
    impact = row['Impact_SHAP']
    direction = "↑ AUGMENTE" if impact > 0 else "↓ DIMINUE"
    color = "🔴" if impact > 0 else "🟢"
    print(f"{color} {row['Feature']:<30} | Valeur: {row['Valeur']:<10.2f} | Impact: {impact:>8.4f} {direction} le risque")

#  EXPLICATION 2: Waterfall Plot individuel
print("\n Génération du Waterfall Plot pour ce client...")
try:
    plt.figure(figsize=(12, 8))
    shap.plots.waterfall(
        shap.Explanation(
            values=client_shap_values[0],
            base_values=expected_val,
            data=nouveau_client_df.iloc[0].values,
            feature_names=all_features
        ),
        show=False
    )
    plt.title(f"Explication SHAP - {'REJET' if prediction == 1 else 'APPROBATION'} du Prêt")
    plt.tight_layout()
    plt.show()
    print(" Waterfall Plot généré!")
except Exception as e:
    print(f" Waterfall Plot non généré: {e}")

#  EXPLICATION 3: Force Plot individuel
print("\n Génération du Force Plot pour ce client...")
try:
    shap.initjs()
    force_plot = shap.force_plot(
        expected_val,
        client_shap_values[0],
        nouveau_client_df.iloc[0],
        show=False
    )
    shap.save_html("client_explanation.html", force_plot)
    print(" Force Plot sauvegardé dans 'client_explanation.html'")
    print("   Ouvrez ce fichier dans votre navigateur pour voir l'explication interactive!")
except Exception as e:
    print(f" Force Plot non généré: {e}")

#  EXPLICATION 4: Bar Plot des impacts
print("\n Génération du Bar Plot des impacts...")
plt.figure(figsize=(12, 8))
top_10_features = contributions.head(10).sort_values('Impact_SHAP')
colors = ['red' if x > 0 else 'green' for x in top_10_features['Impact_SHAP']]
plt.barh(top_10_features['Feature'], top_10_features['Impact_SHAP'], color=colors)
plt.xlabel('Impact SHAP (positif = augmente le risque, négatif = diminue le risque)')
plt.title(f"Impact des Features - {'REJET' if prediction == 1 else 'APPROBATION'} du Client")
plt.axvline(x=0, color='black', linestyle='--', linewidth=0.8)
plt.tight_layout()
plt.show()

print("\n" + "="*60)
print(" ANALYSE COMPLÈTE DU NOUVEAU CLIENT TERMINÉE!")
print("="*60)

#  FONCTION RÉUTILISABLE POUR TESTER D'AUTRES CLIENTS
print("\n CONSEIL: Pour tester un autre client, modifiez les valeurs dans 'nouveau_client'")
print("   et relancez la section 15 du code!")