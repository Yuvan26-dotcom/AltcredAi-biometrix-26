import xgboost as xgb
import shap
import pandas as pd
import pickle
import os

MODEL_PATH = "model.pkl"
model = None
explainer = None

def load_model():
    global model, explainer
    if os.path.exists(MODEL_PATH):
        with open(MODEL_PATH, 'rb') as f:
            model = pickle.load(f)
        explainer = shap.TreeExplainer(model)
        print("Model and Explainer loaded successfully.")
    else:
        print(f"Model not found at {MODEL_PATH}")

def predict_score(features_dict):
    if model is None:
        raise Exception("Model is not loaded.")
        
    # Order must match training
    feature_names = [
        'upi_txn_per_month',
        'bill_payment_rate',
        'income_stability_score',
        'monthly_spend_variance',
        'cash_flow_ratio',
        'digital_wallet_usage',
        'aadhaar_linked_txns',
        'jandhan_account_active',
        'kirana_digital_payments',
        'recharge_frequency',
        'govt_scheme_beneficiary',
        'self_help_group_member'
    ]
    
    df = pd.DataFrame([features_dict], columns=feature_names)
    
    # Predict default probabilities (Risk Score: 0 to 1)
    risk_score = float(model.predict_proba(df)[0, 1])
    
    # Assign Risk label
    risk_label = "High Risk" if risk_score >= 0.5 else "Low Risk"
    
    # SHAP explainability
    shap_values = explainer.shap_values(df)
    
    shap_dict = {col: float(val) for col, val in zip(df.columns, shap_values[0])}
    
    # Analyize most impactful feature
    sorted_shap = sorted(shap_dict.items(), key=lambda x: abs(x[1]), reverse=True)
    top_feature, top_impact = sorted_shap[0]
    
    readable_feature = top_feature.replace('_', ' ')
    
    if risk_label == "High Risk":
        if top_impact > 0:
            decision_reason = f"Applicant is classified as High Risk primarily due to concerns with their {readable_feature}."
        else:
            decision_reason = f"Applicant is High Risk despite having a strong {readable_feature}."
    else:
        if top_impact < 0:
            decision_reason = f"Applicant is classified as Low Risk primarily due to their excellent {readable_feature}."
        else:
            decision_reason = f"Applicant is Low Risk, although their {readable_feature} is slightly concerning."
            
    return risk_score, risk_label, shap_dict, decision_reason
