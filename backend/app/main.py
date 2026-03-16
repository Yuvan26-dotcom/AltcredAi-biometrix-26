from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
from . import models, database, ml

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="AltCredAI API")
# trigger reload

# Configure CORS for React frontend (Fixing CORS issue)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    ml.load_model()

@app.post("/score")
def score_applicant(submission: models.ApplicantCreate):
    # This endpoint just scores, it doesn't save to DB directly based on frontend flow
    features = {
        'upi_txn_per_month': submission.upi_txn_per_month,
        'bill_payment_rate': submission.bill_payment_rate,
        'income_stability_score': submission.income_stability_score,
        'monthly_spend_variance': submission.monthly_spend_variance,
        'cash_flow_ratio': submission.cash_flow_ratio,
        'digital_wallet_usage': submission.digital_wallet_usage,
        'aadhaar_linked_txns': submission.aadhaar_linked_txns,
        'jandhan_account_active': submission.jandhan_account_active,
        'kirana_digital_payments': submission.kirana_digital_payments,
        'recharge_frequency': submission.recharge_frequency,
        'govt_scheme_beneficiary': submission.govt_scheme_beneficiary,
        'self_help_group_member': submission.self_help_group_member
    }
    
    try:
        risk_score, risk_label, shap_values, decision_reason = ml.predict_score(features)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    return {
        "risk_score": risk_score,
        "risk_label": risk_label,
        "shap_values": shap_values,
        "decision_reason": decision_reason
    }

@app.post("/applicants", response_model=models.ApplicantResponse)
def save_applicant(applicant: models.ApplicantSave, db: Session = Depends(database.get_db)):
    db_applicant = models.Applicant(
        **applicant.model_dump()
    )
    db.add(db_applicant)
    db.commit()
    db.refresh(db_applicant)
    return db_applicant

@app.get("/applicants", response_model=list[models.ApplicantResponse])
def get_applicants(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    applicants = db.query(models.Applicant).order_by(models.Applicant.created_at.desc()).offset(skip).limit(limit).all()
    return applicants

@app.get("/stats")
def get_stats(db: Session = Depends(database.get_db)):
    from datetime import datetime, timedelta
    
    total = db.query(models.Applicant).count()
    approved = db.query(models.Applicant).filter(models.Applicant.risk_label == 'Low Risk').count()
    
    cold_start_query = db.query(models.Applicant).filter(
        models.Applicant.aadhaar_linked_txns <= 2,
        models.Applicant.jandhan_account_active == 0
    )
    cold_start = cold_start_query.count()
    
    if cold_start > 0:
        cold_start_approved = cold_start_query.filter(
            models.Applicant.risk_label.in_(['Low Risk', 'Medium Risk'])
        ).count()
        cold_start_approval_rate = float(cold_start_approved / cold_start * 100)
    else:
        cold_start_approval_rate = 0.0
        
    one_week_ago = datetime.utcnow() - timedelta(days=7)
    this_week_count = db.query(models.Applicant).filter(models.Applicant.created_at >= one_week_ago).count()
    
    avg_score = db.query(func.avg(models.Applicant.risk_score)).scalar() or 0.0
    
    return {
        "total": total,
        "approved": approved,
        "cold_start": cold_start,
        "cold_start_approval_rate": round(cold_start_approval_rate, 1),
        "this_week_count": this_week_count,
        "avg_score": avg_score
    }

import json

@app.get("/model/comparison")
def get_model_comparison():
    try:
        with open("metrics.json", "r") as f:
            data = json.load(f)
        return data.get("comparison", {})
    except Exception as e:
        return {"xgboost": {}, "random_forest": {}}

@app.get("/model/feature-importance")
def get_feature_importance():
    try:
        with open("metrics.json", "r") as f:
            data = json.load(f)
        return data.get("feature_importance", {})
    except Exception as e:
        return {}

@app.get("/model/confusion-matrix")
def get_confusion_matrix():
    try:
        with open("metrics.json", "r") as f:
            data = json.load(f)
        return data.get("confusion_matrix", {})
    except Exception as e:
        return {}

