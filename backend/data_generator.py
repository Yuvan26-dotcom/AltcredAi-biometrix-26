import pandas as pd
import numpy as np
import os

def generate_data(num_samples=5000):
    np.random.seed(42)
    
    # 1. Generate inputs
    upi_transactions_monthly = np.random.randint(10, 500, num_samples)
    late_utility_payments = np.random.randint(0, 10, num_samples)
    income_stability_index = np.random.uniform(0.1, 1.0, num_samples)
    essential_spending_ratio = np.random.uniform(0.2, 0.9, num_samples)
    savings_rate = np.random.uniform(0.0, 0.4, num_samples)
    
    # Introduce some correlations
    # A person with high income stability likely has fewer late payments
    late_utility_payments = np.clip(late_utility_payments - (income_stability_index * 5).astype(int), 0, 10)
    # A person with high savings rate likely has lower essential spending ratio
    savings_rate = np.clip(savings_rate + (1 - essential_spending_ratio) * 0.2, 0, 0.5)

    # Calculate a score based on heuristic rules (to act as ground truth for model)
    score = 600 \
          + (upi_transactions_monthly * 0.2) \
          - (late_utility_payments * 25) \
          + (income_stability_index * 150) \
          - (essential_spending_ratio * 100) \
          + (savings_rate * 300)
    
    # Add noise
    score += np.random.normal(0, 20, num_samples)
    
    # Clip to standard credit score range
    score = np.clip(score, 300, 900).astype(int)
    
    df = pd.DataFrame({
        'upi_transactions_monthly': upi_transactions_monthly,
        'late_utility_payments': late_utility_payments,
        'income_stability_index': income_stability_index,
        'essential_spending_ratio': essential_spending_ratio,
        'savings_rate': savings_rate,
        'credit_score': score
    })
    
    # Save to CSV
    os.makedirs('data', exist_ok=True)
    df.to_csv('data/synthetic_credit_data.csv', index=False)
    print(f"Generated {num_samples} samples and saved to data/synthetic_credit_data.csv")

if __name__ == "__main__":
    generate_data()
