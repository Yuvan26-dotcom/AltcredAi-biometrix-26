import pandas as pd
import numpy as np

def generate_data(num_samples=5000):
    np.random.seed(42)
    
    # Generate alternative financial features
    upi_txn_per_month = np.random.randint(0, 201, num_samples)
    bill_payment_rate = np.random.uniform(0.0, 1.0, num_samples)
    income_stability_score = np.random.uniform(0.0, 1.0, num_samples)
    monthly_spend_variance = np.random.randint(500, 20001, num_samples)
    cash_flow_ratio = np.random.uniform(0.0, 2.0, num_samples)
    digital_wallet_usage = np.random.randint(0, 101, num_samples)
    
    # Logical derivation of loan_default
    # - Higher bill payment rate, income stability, and cash flow ratio -> LOWER default risk
    # - Higher monthly spend variance -> HIGHER default risk
    # - Higher UPI transactions -> indicative of active financial life (LOWER risk)
    
    # Calculate a raw risk score using heuristics
    score = (
        (1.0 - bill_payment_rate) * 3.0 +
        (1.0 - income_stability_score) * 2.0 +
        (monthly_spend_variance / 20000.0) * 1.5 +
        np.maximum(0, 1.0 - cash_flow_ratio) * 2.5 +
        (1.0 - (upi_txn_per_month / 200.0)) * 0.5
    )
    
    # Add random noise to simulate real-world variance
    score += np.random.normal(0, 1.0, num_samples)
    
    # Determine default threshold (e.g., top 25% highest risk scores will default)
    threshold = np.percentile(score, 75)
    loan_default = (score > threshold).astype(int)
    
    # Compile dataframe
    df = pd.DataFrame({
        'upi_txn_per_month': upi_txn_per_month,
        'bill_payment_rate': bill_payment_rate,
        'income_stability_score': income_stability_score,
        'monthly_spend_variance': monthly_spend_variance,
        'cash_flow_ratio': cash_flow_ratio,
        'digital_wallet_usage': digital_wallet_usage,
        'loan_default': loan_default
    })
    
    # Save to CSV
    df.to_csv('synthetic_data.csv', index=False)
    print(f"Generated {num_samples} rows of synthetic data in synthetic_data.csv")
    print(f"Target distribution (Default Rate): {loan_default.mean():.2%}")

if __name__ == "__main__":
    generate_data()
