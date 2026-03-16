import pandas as pd
import xgboost as xgb
import pickle
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, roc_auc_score, precision_score, recall_score
import os

def train():
    if not os.path.exists('synthetic_data.csv'):
        print("Data not found. Please run generate_data.py first.")
        return

    # Load data
    df = pd.read_csv('synthetic_data.csv')
    X = df.drop(columns=['loan_default'])
    y = df['loan_default']
    
    # Train-test split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Initialize XGBoost Classifier
    model = xgb.XGBClassifier(
        n_estimators=100,
        max_depth=5,
        learning_rate=0.1,
        random_state=42,
        eval_metric='logloss'
    )
    
    # Train model
    model.fit(X_train, y_train)
    
    # Predict
    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]
    
    # Evaluate metrics
    acc = accuracy_score(y_test, y_pred)
    auc = roc_auc_score(y_test, y_prob)
    prec = precision_score(y_test, y_pred)
    rec = recall_score(y_test, y_pred)
    
    print("--- XGBoost Model Performance ---")
    print(f"Accuracy:  {acc:.4f}")
    print(f"AUC-ROC:   {auc:.4f}")
    print(f"Precision: {prec:.4f}")
    print(f"Recall:    {rec:.4f}")
    print("---------------------------------")
    
    # Save the model
    with open('model.pkl', 'wb') as f:
        pickle.dump(model, f)
    print("Model successfully saved to model.pkl")

if __name__ == "__main__":
    train()
