"""
main.py — AltCredAI FastAPI Backend
=====================================
REST API serving real-time alternative credit scoring.
Connects the XGBoost ML engine to the React frontend.

Endpoints:
  POST /score          — Score an applicant, return risk + SHAP
  POST /applicants     — Save a scored applicant to database
  GET  /applicants     — Retrieve all scored applicants
  GET  /stats          — Dashboard metrics (totals, approval rate)
  GET  /model/comparison     — XGBoost vs Random Forest metrics
  GET  /model/feature-importance — Top 6 features by importance

Why FastAPI over Flask:
  3x faster, built-in Pydantic validation, auto /docs generation,
  async support for concurrent bank officer queries.

Run: uvicorn main:app --reload
Docs: http://localhost:8000/docs
"""

from fastapi import FastAPI, Depends, HTTPException
import random
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
from . import models, database, ml

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="AltCredAI API")
# trigger reload

# ── CORS: allow React dev server at localhost:5173 and localhost:3000
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    # ── Startup: load both models into memory once (not per request)
    ml.load_model()

@app.post("/score")
def score_applicant(submission: models.ApplicantCreate):
    # ── POST /score: validate input → run XGBoost → compute SHAP → return JSON
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

@app.delete("/applicants/{applicant_id}")
def delete_applicant(applicant_id: int, db: Session = Depends(database.get_db)):
    db_applicant = db.query(models.Applicant).filter(models.Applicant.id == applicant_id).first()
    if not db_applicant:
        raise HTTPException(status_code=404, detail="Applicant not found")
    db.delete(db_applicant)
    db.commit()
    return {"message": "Applicant deleted successfully"}

@app.get("/fetch-upi-data")
def fetch_upi_data(upi_id: str):
    from datetime import datetime, timedelta
    import uuid
    import random
    
    total_txns = random.randint(120, 600)
    
    # Generate fake transactions
    merchants = ["Swiggy", "Zomato", "DMart", "Amazon", "Flipkart", "Uber", "Ola", "BESCOM Electricity", "Jio Recharge", "Airtel Recharge", "PhonePe Transfer", "GPay Transfer", "Local Kirana", "Pharmacy"]
    categories = ["Food", "Shopping", "Transport", "Bill Payment", "Recharge", "Transfer", "Health"]
    
    txns = []
    now = datetime.utcnow()
    for _ in range(10):
        days_ago = random.randint(1, 180)
        txn_date = now - timedelta(days=days_ago)
        merchant = random.choice(merchants)
        amount = random.randint(50, 5000)
        category = random.choice(categories)
        txns.append({
            "date": txn_date.strftime("%b %d"),
            "merchant": merchant,
            "amount": amount,
            "type": category
        })
    txns.sort(key=lambda x: datetime.strptime(x["date"], "%b %d").replace(year=2024), reverse=True)

    base_response = {
        "ver": "1.0",
        "timestamp": now.isoformat() + "Z",
        "txnid": str(uuid.uuid4()),
        "FI": {
            "type": "DEPOSIT",
            "maskedAccNumber": f"XXXX{random.randint(1000,9999)}",
            "linkedUpiId": upi_id,
            "summary": {
                "currentBalance": random.randint(5000, 50000),
                "monthlyAverageBalance": random.randint(3000, 30000)
            },
            "Transactions": {
                "totalCount": total_txns,
                "months": 6,
                "data": txns
            }
        },
        "dataSource": "Account Aggregator (Simulated)",
        "consentId": str(uuid.uuid4()),
        "derivedFeatures": {}
    }

    upi_lower = upi_id.lower()
    
    features = {}
    name = ""
    if "meera@" in upi_lower:
        name = "Meera (Gig Worker)"
        features = {
            "upi_txn_per_month": 85,
            "bill_payment_rate": 0.94,
            "income_stability_score": 0.71,
            "monthly_spend_variance": 3200,
            "cash_flow_ratio": 1.3,
            "digital_wallet_usage": 78,
            "aadhaar_linked_txns": 0,
            "jandhan_account_active": 0,
            "kirana_digital_payments": 15,
            "recharge_frequency": 10,
            "govt_scheme_beneficiary": 1,
            "self_help_group_member": 1
        }
    elif "suresh@" in upi_lower:
        name = "Suresh (Street Vendor)"
        features = {
            "upi_txn_per_month": 22,
            "bill_payment_rate": 0.61,
            "income_stability_score": 0.48,
            "monthly_spend_variance": 8900,
            "cash_flow_ratio": 0.9,
            "digital_wallet_usage": 31,
            "aadhaar_linked_txns": 8,
            "jandhan_account_active": 1,
            "kirana_digital_payments": 25,
            "recharge_frequency": 6,
            "govt_scheme_beneficiary": 1,
            "self_help_group_member": 0
        }
    elif "vijay@" in upi_lower:
        name = "Vijay (Irregular Income)"
        features = {
            "upi_txn_per_month": 8,
            "bill_payment_rate": 0.31,
            "income_stability_score": 0.22,
            "monthly_spend_variance": 15000,
            "cash_flow_ratio": 0.5,
            "digital_wallet_usage": 12,
            "aadhaar_linked_txns": 2,
            "jandhan_account_active": 0,
            "kirana_digital_payments": 5,
            "recharge_frequency": 2,
            "govt_scheme_beneficiary": 0,
            "self_help_group_member": 0
        }
    else:
        raise HTTPException(status_code=400, detail="UPI ID not found in Mock Account Aggregator registry. Please try meera@okaxis, suresh@okaxis, or vijay@okaxis.")
        
    base_response["derivedFeatures"] = features
    base_response["name"] = name
        
    return base_response


@app.get("/stats")
def get_stats(db: Session = Depends(database.get_db)):
    from datetime import datetime, timedelta
    
    total = db.query(models.Applicant).count()
    approved = db.query(models.Applicant).filter(models.Applicant.risk_label == 'Low Risk').count()
    
    # ── Cold-start detection: applicants with no Aadhaar + no Jan Dhan
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

