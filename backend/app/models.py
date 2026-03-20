"""
schema.py — AltCredAI Pydantic Data Models
===========================================
Request and response schemas for all FastAPI endpoints.
Pydantic validates every API call automatically — wrong data
types return clear error messages instead of crashing.

ScoreRequest: 12 alternative financial features for one applicant
ScoreResponse: risk_score, risk_label, shap_values, decision_reason
ApplicantResponse: full applicant record from database
StatsResponse: dashboard metrics for the overview page
"""

from sqlalchemy import Column, Integer, Float, String, DateTime
from datetime import datetime
from .database import Base
from pydantic import BaseModel

# SQLAlchemy Models
class Applicant(Base):
    __tablename__ = "applicants"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    # ── Each column mirrors a feature from predict.py's input schema
    upi_txn_per_month = Column(Integer)
    bill_payment_rate = Column(Float)
    income_stability_score = Column(Float)
    monthly_spend_variance = Column(Integer)
    cash_flow_ratio = Column(Float)
    digital_wallet_usage = Column(Integer)
    aadhaar_linked_txns = Column(Integer)
    jandhan_account_active = Column(Integer)
    kirana_digital_payments = Column(Integer)
    recharge_frequency = Column(Integer)
    govt_scheme_beneficiary = Column(Integer)
    self_help_group_member = Column(Integer)
    # ── risk_score stored as Float for sorting and filtering
    risk_score = Column(Float)
    risk_label = Column(String)
    # ── timestamp auto-set on insert for the dashboard scoring log
    created_at = Column(DateTime, default=datetime.utcnow)

# Pydantic Models for Input/Output Validation
class ApplicantCreate(BaseModel):
    name: str = "Anonymous"
    upi_txn_per_month: int
    bill_payment_rate: float
    income_stability_score: float
    monthly_spend_variance: int
    cash_flow_ratio: float
    digital_wallet_usage: int
    aadhaar_linked_txns: int
    jandhan_account_active: int
    kirana_digital_payments: int
    recharge_frequency: int
    govt_scheme_beneficiary: int
    self_help_group_member: int

class ApplicantSave(ApplicantCreate):
    risk_score: float
    risk_label: str

class ApplicantResponse(BaseModel):
    id: int
    name: str
    upi_txn_per_month: int | None = None
    bill_payment_rate: float | None = None
    income_stability_score: float | None = None
    monthly_spend_variance: int | None = None
    cash_flow_ratio: float | None = None
    digital_wallet_usage: int | None = None
    aadhaar_linked_txns: int | None = None
    jandhan_account_active: int | None = None
    kirana_digital_payments: int | None = None
    recharge_frequency: int | None = None
    govt_scheme_beneficiary: int | None = None
    self_help_group_member: int | None = None
    risk_score: float
    risk_label: str
    created_at: datetime
    
    class Config:
        from_attributes = True
