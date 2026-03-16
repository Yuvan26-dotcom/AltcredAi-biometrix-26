export const FEATURE_LABELS = {
  upi_txn_per_month: "UPI Transactions / Month",
  bill_payment_rate: "Bill Payment Rate",
  income_stability_score: "Income Stability",
  monthly_spend_variance: "Monthly Spend Variance",
  cash_flow_ratio: "Cash Flow Ratio",
  digital_wallet_usage: "Digital Wallet Usage",
  aadhaar_linked_txns: "Aadhaar-Linked Transactions",
  jandhan_account_active: "Jan Dhan Account Active",
  kirana_digital_payments: "Kirana Digital Payments",
  recharge_frequency: "Mobile Recharge Frequency",
  govt_scheme_beneficiary: "Govt Scheme Beneficiary",
  self_help_group_member: "Self-Help Group Member"
};

export const INDIA_SPECIFIC_FEATURES = [
  "aadhaar_linked_txns",
  "jandhan_account_active",
  "kirana_digital_payments",
  "recharge_frequency",
  "govt_scheme_beneficiary",
  "self_help_group_member"
];

export const getFeatureLabel = (featureKey, addFlag = false) => {
  const label = FEATURE_LABELS[featureKey] || featureKey;
  if (addFlag && INDIA_SPECIFIC_FEATURES.includes(featureKey)) {
    return `${label} 🇮🇳`;
  }
  return label;
};
