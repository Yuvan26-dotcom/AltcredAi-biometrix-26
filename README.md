# AltCredAI - Alternative Credit Intelligence

An AI-powered credit scoring system that evaluates loan applicants using alternative financial signals (UPI transactions, bill payments, income stability, spending patterns) instead of traditional CIBIL credit history. Built for the Credit-Vision_Biometrix '26 Hackathon.

## Tech Stack
- **Frontend**: React.js, Tailwind CSS, React Router, Chart.js (Vite)
- **Backend**: Python 3, FastAPI, SQLAlchemy, SQLite
- **Machine Learning**: XGBoost, Random Forest, SHAP (Explainability), Scikit-Learn, Pandas

## How to Run

You will need two terminals to run the system:

**1. Install Dependencies & Start Backend (Terminal 1)**
```bash
cd backend
python -m venv venv
# Activate virtual env:  venv\Scripts\activate (Windows) or source venv/bin/activate (Mac/Linux)
pip install -r requirements.txt

# Run the Data Generation and ML Training Pipeline
python generate_data.py
python train_model.py

# Start the FastAPI Server
uvicorn app.main:app --reload
```
*Backend will be running at `http://localhost:8000`*

**2. Start Frontend (Terminal 2)**
```bash
cd frontend
npm install
npm run dev
```
*Frontend will be running at `http://localhost:5173`*

## API Documentation

The following REST endpoints are exposed via FastAPI at `http://localhost:8000/`:

### Core Endpoints
- `POST /score`
  - Body: JSON of alternative signals (e.g. `upi_txn_per_month`, `bill_payment_rate`)
  - Returns: `risk_score` (0.0 to 1.0), `risk_label` ("Low Risk" | "High Risk"), `shap_values` object, and a plain English `decision_reason`.
  
- `POST /applicants`
  - Body: JSON containing `name`, `risk_score`, and `risk_label`.
  - Action: Saves the processed application into the local SQLite database.

- `GET /applicants`
  - Returns: List of all stored applicants, ordered by recency.

- `GET /stats`
  - Returns: Dashboard metrics including `total`, `approved`, `cold_start`, and `avg_score`.

### Model Insights Endpoints
- `GET /model/comparison`
  - Returns: Accuracy, AUC-ROC, Precision, Recall, and F1 scores for the active XGBoost model vs the shadow Random Forest model.

- `GET /model/feature-importance`
  - Returns: The top 6 driving features based on the trained model.

- `GET /model/confusion-matrix`
  - Returns: True Positive, False Positive, True Negative, False Negative matrix for the isolated validation set.
