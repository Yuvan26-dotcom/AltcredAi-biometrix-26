/**
 * featureLabels.js — Human-readable names for ML feature keys
 * =============================================================
 * Maps Python snake_case feature names to display labels.
 * Used everywhere SHAP values or feature names appear in the UI.
 * Prevents raw variable names like "self_help_group_member"
 * from showing in the dashboard — unprofessional for a demo.
 */

export const featureLabels = {
  upi_txn_per_month: "UPI Transactions per Month",
  bill_payment_rate: "Bill Payment Rate",
  income_stability_score: "Income Stability Score",
  monthly_spend_variance: "Monthly Spend Variance",
  cash_flow_ratio: "Cash Flow Ratio",
  digital_wallet_usage: "Digital Wallet Usage",
  aadhaar_linked_txns: "Aadhaar Linked Transactions",
  jandhan_account_active: "Jan Dhan Account Active",
  kirana_digital_payments: "Kirana Digital Payments",
  recharge_frequency: "Recharge Frequency",
  govt_scheme_beneficiary: "Govt Scheme Beneficiary",
  self_help_group_member: "Self Help Group Member",
};
