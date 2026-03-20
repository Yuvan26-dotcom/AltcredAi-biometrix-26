"""
database.py — AltCredAI Database Configuration
===============================================
SQLite database setup using SQLAlchemy ORM.
Stores all scored applicants for dashboard history.

Why SQLite for hackathon:
  Zero setup, file-based, no credentials needed.
  Upgrade path: swap DATABASE_URL to PostgreSQL with one config change.
  SQLAlchemy ORM ensures the same Python code works for both.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

SQLALCHEMY_DATABASE_URL = "sqlite:///./credit_app.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
