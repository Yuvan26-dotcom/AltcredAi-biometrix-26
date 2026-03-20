import React from 'react';
import { motion } from 'framer-motion';

export default function ShapChart({ shapValues, finalScore }) {
  if (!shapValues) return null;

  const featureMap = {
    'upi_txn_per_month': 'UPI Transactions',
    'bill_payment_rate': 'Bill Payment Rate',
    'income_stability_score': 'Income Stability',
    'monthly_spend_variance': 'Spend Variance',
    'cash_flow_ratio': 'Cash Flow Ratio',
    'digital_wallet_usage': 'Digital Wallet Usage',
    'aadhaar_linked_txns': 'Aadhaar Auth Txns',
    'jandhan_account_active': 'Jan Dhan Account',
    'kirana_digital_payments': 'Kirana Digital Payments',
    'recharge_frequency': 'Recharge Frequency',
    'govt_scheme_beneficiary': 'Govt Scheme Beneficiary',
    'self_help_group_member': 'SHG Membership'
  };

  const entries = Object.entries(shapValues).map(([k, v]) => ({
    label: featureMap[k] || k,
    value: v
  }));

  const maxAbs = Math.max(...entries.map(e => Math.abs(e.value))) || 1;

  return (
    <div className="space-y-3 py-4">
      {entries.map((item, idx) => {
        const isNegative = item.value < 0; 
        const percent = (Math.abs(item.value) / maxAbs) * 100;
        
        return (
          <motion.div 
            key={item.label}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.05 }}
            className="flex items-center gap-4 group relative cursor-default"
          >
            <div className="w-[175px] text-[10px] font-dm uppercase tracking-widest text-right whitespace-normal leading-tight text-[var(--text2)] group-hover:text-[var(--text)] transition-colors">
              {item.label}
            </div>
            
            <div className="flex-1 h-6 relative flex items-center">
                <div className="w-full flex items-center">
                  <div className="w-1/2 flex justify-end pr-[1px]">
                    {isNegative && (
                      <motion.div 
                        initial={{ width: 0 }}
                        whileInView={{ width: `${percent}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: idx * 0.05 }}
                        className="h-[6px] bg-[var(--green)] opacity-80 rounded-l-full group-hover:opacity-100 group-hover:shadow-[0_0_8px_var(--green)] group-hover:h-[8px] transition-all"
                      />
                    )}
                  </div>
                  <div className="w-[2px] h-3 bg-[var(--bg4)] rounded z-10" />
                  <div className="w-1/2 flex justify-start pl-[1px]">
                    {!isNegative && (
                       <motion.div 
                        initial={{ width: 0 }}
                        whileInView={{ width: `${percent}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: idx * 0.05 }}
                        className="h-[6px] bg-[var(--red)] opacity-80 rounded-r-full group-hover:opacity-100 group-hover:shadow-[0_0_8px_var(--red)] group-hover:h-[8px] transition-all"
                      />
                    )}
                  </div>
                </div>
            </div>
            
            <div className={`w-[55px] text-right text-xs font-mono font-bold ${isNegative ? 'text-[var(--green)]' : 'text-[var(--red)]'}`}>
              {isNegative ? '-' : '+'}{(Math.abs(item.value)*100).toFixed(1)}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
