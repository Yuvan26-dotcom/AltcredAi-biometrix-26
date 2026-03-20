import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

const API_BASE = 'http://localhost:8000/model';

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

export default function Insights() {
  const [data, setData] = useState({
    comparison: null,
    importance: null,
    matrix: null,
    applicants: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      const [compRes, impRes, matRes, appRes] = await Promise.all([
        axios.get(`${API_BASE}/comparison`),
        axios.get(`${API_BASE}/feature-importance`),
        axios.get(`${API_BASE}/confusion-matrix`),
        axios.get(`http://localhost:8000/applicants`).catch(() => ({ data: [] }))
      ]);
      
      setData({
        comparison: compRes.data,
        importance: impRes.data,
        matrix: matRes.data,
        applicants: appRes.data
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[var(--orange)] border-t-transparent animate-spin"></div>
      </div>
    );
  }

  const { comparison, importance, matrix, applicants } = data;

  const featureMap = {
    'upi_txn_per_month': 'UPI Transactions',
    'bill_payment_rate': 'Bill Payment Rate',
    'income_stability_score': 'Income Stability',
    'monthly_spend_variance': 'Spend Variance',
    'cash_flow_ratio': 'Cash Flow Ratio',
    'digital_wallet_usage': 'Digital Wallet Usage',
  };

  let importanceData = [];
  if (importance && Object.keys(importance).length > 0) {
    importanceData = Object.entries(importance)
      .map(([k, v]) => ({ label: featureMap[k] || k, value: parseFloat(v) }))
      .sort((a,b) => b.value - a.value);
  }

  let histData = [0, 0, 0, 0, 0];
  if (applicants && applicants.length > 0) {
    applicants.forEach(app => {
      const pd = app.risk_score * 100;
      if (pd < 20) histData[0]++;
      else if (pd < 40) histData[1]++;
      else if (pd < 60) histData[2]++;
      else if (pd < 80) histData[3]++;
      else histData[4]++;
    });
  }
  const maxHist = Math.max(...histData) || 1;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-[1200px] mx-auto space-y-12 pb-16"
    >
      <div>
        <h1 className="font-syne text-4xl text-[var(--text)] tracking-tight">Model Insights</h1>
        <p className="font-dm text-[var(--text2)] mt-2">Deep dive into algorithm performance and feature reasoning.</p>
      </div>

      {/* Model Comparison */}
      {comparison && comparison.xgboost && comparison.random_forest && (
        <motion.div variants={fadeUp} initial="hidden" animate="visible" className="space-y-6">
          <h2 className="font-dm text-[11px] uppercase tracking-widest text-[var(--text3)] px-2">Shadow Model Comparison</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* XGBoost Card */}
            <div className="bg-[var(--bg3)] rounded-[16px] p-8 relative">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-syne text-2xl text-[var(--text)]">XGBoost</h3>
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[var(--orange-glow)] rounded text-[10px] font-bold font-dm uppercase tracking-widest text-[var(--orange)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--orange)]"></span>
                    ACTIVE
                </div>
              </div>
              
              <div className="space-y-5">
                <MetricRow label="AUC-ROC" val1={comparison.xgboost.auc_roc} val2={comparison.random_forest.auc_roc} isWinner={comparison.xgboost.auc_roc >= comparison.random_forest.auc_roc} />
                <MetricRow label="Accuracy" val1={comparison.xgboost.accuracy} val2={comparison.random_forest.accuracy} isWinner={comparison.xgboost.accuracy >= comparison.random_forest.accuracy} />
                <MetricRow label="Precision" val1={comparison.xgboost.precision} val2={comparison.random_forest.precision} isWinner={comparison.xgboost.precision >= comparison.random_forest.precision} />
                <MetricRow label="Recall" val1={comparison.xgboost.recall} val2={comparison.random_forest.recall} isWinner={comparison.xgboost.recall >= comparison.random_forest.recall} />
                <MetricRow label="F1 Score" val1={comparison.xgboost.f1} val2={comparison.random_forest.f1} isWinner={comparison.xgboost.f1 >= comparison.random_forest.f1} />
              </div>
            </div>

            {/* Random Forest Card */}
            <div className="bg-[var(--bg2)] rounded-[16px] p-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-syne text-2xl text-[var(--text2)]">Random Forest</h3>
              </div>
              
              <div className="space-y-5">
                <MetricRow label="AUC-ROC" val1={comparison.random_forest.auc_roc} val2={comparison.xgboost.auc_roc} isWinner={comparison.random_forest.auc_roc > comparison.xgboost.auc_roc} />
                <MetricRow label="Accuracy" val1={comparison.random_forest.accuracy} val2={comparison.xgboost.accuracy} isWinner={comparison.random_forest.accuracy > comparison.xgboost.accuracy} />
                <MetricRow label="Precision" val1={comparison.random_forest.precision} val2={comparison.xgboost.precision} isWinner={comparison.random_forest.precision > comparison.xgboost.precision} />
                <MetricRow label="Recall" val1={comparison.random_forest.recall} val2={comparison.xgboost.recall} isWinner={comparison.random_forest.recall > comparison.xgboost.recall} />
                <MetricRow label="F1 Score" val1={comparison.random_forest.f1} val2={comparison.xgboost.f1} isWinner={comparison.random_forest.f1 > comparison.xgboost.f1} />
              </div>
            </div>

          </div>
        </motion.div>
      )}

      {/* Grid for Chart and Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Feature Importance Chart */}
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once:true }} className="bg-[var(--bg2)] rounded-[16px] p-8 flex flex-col">
          <h2 className="font-dm text-[11px] uppercase tracking-widest text-[var(--text3)] mb-8">Feature Importance (Active Model)</h2>
          <div className="flex-1 w-full space-y-4">
             {importanceData.length > 0 ? (
               importanceData.map((item, idx) => {
                 const percent = Math.max(0, Math.min(100, (item.value / importanceData[0].value) * 100));
                 return (
                   <div key={item.label} className="group relative flex items-center gap-4">
                     <div className="w-[120px] text-[10px] font-dm uppercase tracking-widest text-[var(--text2)] text-right group-hover:text-[var(--text)] transition-colors">
                       {item.label}
                     </div>
                     <div className="flex-1 h-3 rounded bg-[var(--bg3)] overflow-hidden">
                       <motion.div 
                         initial={{ width: 0 }}
                         whileInView={{ width: `${percent}%` }}
                         viewport={{ once: true }}
                         transition={{ duration: 0.6, delay: idx * 0.1 }}
                         className="h-full bg-[var(--orange)] rounded group-hover:shadow-[0_0_8px_var(--orange)] opacity-90 group-hover:opacity-100 transition-all"
                       />
                     </div>
                   </div>
                 );
               })
             ) : (
                <p className="text-[var(--text3)] font-dm text-sm">No data generated yet.</p>
             )}
          </div>
        </motion.div>

        {/* Confusion Matrix & Distribution */}
        <div className="space-y-6 flex flex-col">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once:true }} className="bg-[var(--bg2)] rounded-[16px] p-8 flex flex-col">
            <h2 className="font-dm text-[11px] uppercase tracking-widest text-[var(--text3)] mb-8">Confusion Matrix (Validation)</h2>
            
            {matrix ? (
              <div className="flex-1 flex flex-col justify-center">
                <div className="grid grid-cols-2 gap-4">
                  {/* TN */}
                  <div className="aspect-square bg-[var(--bg)] border-[1px] border-[rgba(0,214,143,0.3)] rounded-xl flex flex-col items-center justify-center transition-transform hover:scale-[1.03]">
                    <span className="text-[32px] font-mono font-bold text-[var(--text)] mb-2">{matrix.tn}</span>
                    <span className="text-[10px] font-dm uppercase tracking-widest text-[var(--green)] text-center">True Negative<br/>(Correctly Approved)</span>
                  </div>
                  
                  {/* FP */}
                  <div className="aspect-square bg-[var(--bg)] border-[1px] border-[rgba(255,71,87,0.3)] rounded-xl flex flex-col items-center justify-center transition-transform hover:scale-[1.03]">
                    <span className="text-[32px] font-mono font-bold text-[var(--text)] mb-2">{matrix.fp}</span>
                    <span className="text-[10px] font-dm uppercase tracking-widest text-[var(--red)] text-center">False Positive<br/>(False Approval)</span>
                  </div>
                  
                  {/* FN */}
                  <div className="aspect-square bg-[var(--bg)] border-[1px] border-[rgba(255,71,87,0.3)] rounded-xl flex flex-col items-center justify-center transition-transform hover:scale-[1.03]">
                    <span className="text-[32px] font-mono font-bold text-[var(--text)] mb-2">{matrix.fn}</span>
                    <span className="text-[10px] font-dm uppercase tracking-widest text-[var(--red)] text-center">False Negative<br/>(Missed Approval)</span>
                  </div>
                  
                  {/* TP */}
                  <div className="aspect-square bg-[var(--bg)] border-[1px] border-[rgba(0,214,143,0.3)] rounded-xl flex flex-col items-center justify-center transition-transform hover:scale-[1.03]">
                    <span className="text-[32px] font-mono font-bold text-[var(--text)] mb-2">{matrix.tp}</span>
                    <span className="text-[10px] font-dm uppercase tracking-widest text-[var(--green)] text-center">True Positive<br/>(Correctly Rejected)</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-[var(--text3)] font-dm text-sm">No matrix generated yet.</p>
            )}
          </motion.div>

          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once:true }} className="bg-[var(--bg2)] rounded-[16px] p-8 flex flex-col flex-1">
            <h2 className="font-dm text-[11px] uppercase tracking-widest text-[var(--text3)] mb-6">Probability of Default Distribution</h2>
            <div className="flex-1 w-full h-[150px] flex items-end gap-2 px-4 border-b border-[var(--bg4)] pb-1">
                {histData.map((val, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center group relative">
                        <div className="absolute -top-7 text-[10px] font-mono text-[var(--text)] opacity-0 group-hover:opacity-100 transition-opacity">{val}</div>
                        <motion.div 
                            initial={{ height: 0 }}
                            whileInView={{ height: `${(val / maxHist) * 100}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: idx * 0.1 }}
                            className="w-full bg-[var(--text3)] rounded-t hover:bg-[var(--orange)] transition-colors"
                        />
                    </div>
                ))}
            </div>
            <div className="flex justify-between mt-3 font-mono text-[10px] text-[var(--text3)]">
                <span>0%</span>
                <span>20%</span>
                <span>40%</span>
                <span>60%</span>
                <span>80%</span>
                <span>100%</span>
            </div>
          </motion.div>
        </div>

      </div>

    </motion.div>
  );
}

function MetricRow({ label, val1, val2, isWinner }) {
  const valueColor = isWinner ? 'var(--orange)' : 'var(--text2)';
  const labelColor = isWinner ? 'var(--text)' : 'var(--text2)';
  
  return (
    <div className="group">
      <div className="flex justify-between items-center mb-2">
        <span className="font-dm text-[12px] font-medium transition-colors" style={{ color: labelColor }}>{label}</span>
        <span className="font-mono text-[13px] transition-colors" style={{ color: valueColor }}>{(val1 * 100).toFixed(1)}%</span>
      </div>
      <div className="w-full h-[2px] bg-[var(--bg3)] rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          whileInView={{ width: `${Math.min(val1 * 100, 100)}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="h-full rounded-full transition-colors"
          style={{ backgroundColor: valueColor }}
        />
      </div>
    </div>
  );
}
