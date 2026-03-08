from flask import Flask, request, jsonify
import joblib
import pandas as pd

app = Flask(__name__)

#  Charger le modèle pipeline
model_path = "credit_model.pkl"
try:
    model = joblib.load(model_path)
    print(" Modèle chargé avec succès !")
except Exception as e:
    print(" Erreur de chargement du modèle:", e)
    model = None

#  Définir les règles métiers avant la prédiction


def validate_client(data):
    # Vérifier âge
    if data.get("person_age", 0) < 18:
        return False, "Crédit refusé : âge du client inférieur à 18 ans"
    # Vérifier expérience
    if data.get("person_emp_length", 0) > data.get("person_age", 0):
        return False, "Crédit refusé : expérience professionnelle supérieure à l'âge"
    # Vérifier montant du prêt
    if data.get("loan_amnt", 0) <= 0:
        return False, "Crédit refusé : montant du prêt invalide"
    return True, ""


@app.route('/predict', methods=['POST'])
def predict():
    if model is None:
        return jsonify({"error": "Modèle non chargé"}), 500

    data = request.get_json()
    if not data:
        return jsonify({"error": "Aucune donnée reçue"}), 400

    #  Appliquer les règles métiers
    valid, message = validate_client(data)
    if not valid:
        return jsonify({
            "prediction_class": 1,  # 1 = refus
            "prediction_proba": 1.0,  # risque maximal
            "message": message
        })

    try:
        # Transformer en DataFrame
        df = pd.DataFrame([data])

        # Vérifier les colonnes manquantes
        # (préparer DataFrame avec toutes les colonnes attendues par le pipeline)
        preprocessor = model.named_steps['preprocessor']
        num_features = preprocessor.transformers_[0][2]
        cat_pipeline = preprocessor.transformers_[1][1]
        cat_features = preprocessor.transformers_[1][2]

        missing_cols = set(num_features + list(cat_features)) - set(df.columns)
        for col in missing_cols:
            if col in num_features:
                df[col] = 0
            else:
                df[col] = "N/A"

        #  Prédiction
        pred_proba = model.predict_proba(df)[:, 1][0]
        pred_class = model.predict(df)[0]

        return jsonify({
            "prediction_class": int(pred_class),
            "prediction_proba": float(pred_proba)
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)
