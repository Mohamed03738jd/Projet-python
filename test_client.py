import requests

url = "http://127.0.0.1:5000/predict"


client_data = {
    "person_age": 22,
    "person_emp_length": 2,
    "loan_amnt": 10000,
    "person_income": 30000,
    "person_home_ownership": "RENT",
    "person_emp_title": "Intern",
    "loan_intent": "PERSONAL",
    "loan_grade": "C",
    "cb_person_default_on_file": "Y",
    "cb_person_cred_hist_length": 0.5,
    "loan_percent_income": 3.33,  # 100000/30000
    "loan_int_rate": 0.35
}
client_data = {
    "person_age": 35,
    "person_emp_length": 10,
    "loan_amnt": 8000,
    "person_income": 90000,
    "person_home_ownership": "OWN",
    "person_emp_title": "Software Engineer",
    "loan_intent": "EDUCATION",
    "loan_grade": "A",
    "cb_person_default_on_file": "N",
    "cb_person_cred_hist_length": 12,
    "loan_percent_income": 0.09,   # 8000 / 90000
    "loan_int_rate": 0.08
}
response = requests.post(url, json=client_data)

print("Status code:", response.status_code)
try:
    result = response.json()
    print("Risque de défaut :", round(result['prediction_proba']*100, 2), "%")
    if result['prediction_class'] == 0:
        print("Décision : Crédit ACCEPTÉ")
    else:
        print("Décision : Crédit REFUSÉ")
except Exception as e:
    print("Erreur JSON:", e)
    print("Response text:", response.text)
