import pickle
import shap
import pandas as pd
import os

def predict(features_dict):
    """
    Accepts input features and returns the risk score, risk label, SHAP values, and an English explanation.
    """
    if not os.path.exists('model.pkl'):
        raise FileNotFoundError("model.pkl not found. Please run train_model.py first.")
        
    # Load the trained XGBoost model
    with open('model.pkl', 'rb') as f:
        model = pickle.load(f)
        
    df = pd.DataFrame([features_dict])
    
    # Predict default probabilities (Risk Score: 0 to 1)
    risk_score = float(model.predict_proba(df)[0, 1])
    
    # Assign Risk label
    risk_label = "High Risk" if risk_score >= 0.5 else "Low Risk"
    
    # SHAP explainability
    explainer = shap.TreeExplainer(model)
    shap_values = explainer.shap_values(df)
    
    # For XGBoost classifier, SHAP values are typically in log-odds.
    # Map feature names to their corresponding SHAP values for this prediction.
    shap_dict = {col: float(val) for col, val in zip(df.columns, shap_values[0])}
    
    # Analyze the most impactful feature to generate a plain English explanation
    # Sort features by absolute SHAP value (highest impact first)
    sorted_shap = sorted(shap_dict.items(), key=lambda x: abs(x[1]), reverse=True)
    top_feature, top_impact = sorted_shap[0]
    
    # Format the feature name for readability (e.g., 'bill_payment_rate' -> 'bill payment rate')
    readable_feature = top_feature.replace('_', ' ')
    
    if risk_label == "High Risk":
        # If top impact is positive, it pushed the score HIGHER (towards default/High Risk)
        if top_impact > 0:
            decision_reason = f"Applicant is classified as High Risk primarily due to concerns with their {readable_feature}."
        else:
            decision_reason = f"Applicant is High Risk despite having a strong {readable_feature}."
    else:
        # If top impact is negative, it pushed the score LOWER (towards non-default/Low Risk)
        if top_impact < 0:
            decision_reason = f"Applicant is classified as Low Risk primarily due to their excellent {readable_feature}."
        else:
            decision_reason = f"Applicant is Low Risk, although their {readable_feature} is slightly concerning."
            
    return {
        "risk_score": round(risk_score, 4),
        "risk_label": risk_label,
        "shap_values": shap_dict,
        "decision_reason": decision_reason
    }

if __name__ == "__main__":
    # Example 1: Strong applicant
    sample_low_risk = {
        'upi_txn_per_month': 150,
        'bill_payment_rate': 0.95,
        'income_stability_score': 0.85,
        'monthly_spend_variance': 2000,
        'cash_flow_ratio': 1.5,
        'digital_wallet_usage': 80
    }
    
    # Example 2: Weak applicant
    sample_high_risk = {
        'upi_txn_per_month': 20,
        'bill_payment_rate': 0.40,
        'income_stability_score': 0.30,
        'monthly_spend_variance': 15000,
        'cash_flow_ratio': 0.5,
        'digital_wallet_usage': 10
    }
    
    print("\n--- Testing Low Risk Applicant ---")
    res_low = predict(sample_low_risk)
    print(f"Risk Score: {res_low['risk_score']}")
    print(f"Risk Label: {res_low['risk_label']}")
    print(f"Reason:     {res_low['decision_reason']}")
    
    print("\n--- Testing High Risk Applicant ---")
    res_high = predict(sample_high_risk)
    print(f"Risk Score: {res_high['risk_score']}")
    print(f"Risk Label: {res_high['risk_label']}")
    print(f"Reason:     {res_high['decision_reason']}")
