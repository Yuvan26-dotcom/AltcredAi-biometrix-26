import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Network, Database, Layers, BrainCircuit, Combine, Target } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip);

const API_BASE = 'http://localhost:8000/model';

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
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-500 border-t-transparent"></div>
      </div>
    );
  }

  const { comparison, importance, matrix, applicants } = data;

  // Chart Setup
  let chartData = null;
  let chartOptions = null;

  if (importance && Object.keys(importance).length > 0) {
    const featureMap = {
      'upi_txn_per_month': 'UPI Transactions',
      'bill_payment_rate': 'Bill Payment Rate',
      'income_stability_score': 'Income Stability',
      'monthly_spend_variance': 'Spend Variance',
      'cash_flow_ratio': 'Cash Flow Ratio',
      'digital_wallet_usage': 'Digital Wallet Usage',
    };
    
    const labels = Object.keys(importance).map(k => featureMap[k] || k);
    const impValues = Object.values(importance);

    // Dark orange to light orange based on array index
    const colors = [
      '#9a3412', // brand-800
      '#c2410c', // brand-700
      '#ea580c', // brand-600
      '#f97316', // brand-500
      '#fb923c', // brand-400
      '#fdba74', // brand-300
    ].slice(0, impValues.length);

    chartData = {
      labels,
      datasets: [{
        label: 'Relative Importance',
        data: impValues,
        backgroundColor: colors,
        borderRadius: 4,
      }]
    };

    chartOptions = {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#1e293b',
          titleColor: '#f1f5f9',
          bodyColor: '#cbd5e1',
          padding: 12,
          displayColors: false,
        }
      },
      scales: {
        x: { grid: { color: '#334155' }, ticks: { color: '#94a3b8' } },
        y: { grid: { display: false }, ticks: { color: '#e2e8f0', font: {size: 11} } }
      }
    };
  }

  // Histogram Setup
  let histData = null;
  let histOptions = null;
  if (applicants && applicants.length > 0) {
    const buckets = [0, 0, 0, 0, 0];
    applicants.forEach(app => {
      const pd = app.risk_score * 100;
      if (pd < 20) buckets[0]++;
      else if (pd < 40) buckets[1]++;
      else if (pd < 60) buckets[2]++;
      else if (pd < 80) buckets[3]++;
      else buckets[4]++;
    });
    
    histData = {
      labels: ['0-20%', '20-40%', '40-60%', '60-80%', '80-100%'],
      datasets: [{
        label: 'Applicants',
        data: buckets,
        backgroundColor: '#f97316', // brand-500
        borderRadius: 4,
      }]
    };
    
    histOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#1e293b',
          titleColor: '#f1f5f9',
          bodyColor: '#cbd5e1',
          padding: 12,
          displayColors: false,
        }
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: '#94a3b8' } },
        y: { grid: { color: '#334155' }, ticks: { color: '#e2e8f0', precision: 0 } }
      }
    };
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
          <Network className="w-8 h-8 text-brand-500" /> Model Insights
        </h1>
        <p className="text-slate-400 mt-1">Deep dive into algorithm performance and feature reasoning.</p>
      </div>

      {/* Model Comparison */}
      {comparison && comparison.xgboost && comparison.random_forest && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Combine className="w-5 h-5 text-brand-400" /> Shadow Model Comparison
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* XGBoost Card */}
            <div className="bg-slate-800/60 border-2 border-brand-500/50 rounded-2xl p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 py-1 px-4 bg-brand-500 text-white text-xs font-bold rounded-bl-xl shadow-md">
                Active Model
              </div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-brand-500/20 rounded-lg border border-brand-500/30">
                  <Database className="w-6 h-6 text-brand-400" />
                </div>
                <h3 className="text-xl font-bold text-white">XGBoost</h3>
              </div>
              
              <div className="space-y-4">
                <MetricRow label="AUC-ROC" val1={comparison.xgboost.auc_roc} val2={comparison.random_forest.auc_roc} isWinner={comparison.xgboost.auc_roc >= comparison.random_forest.auc_roc} />
                <MetricRow label="Accuracy" val1={comparison.xgboost.accuracy} val2={comparison.random_forest.accuracy} isWinner={comparison.xgboost.accuracy >= comparison.random_forest.accuracy} />
                <MetricRow label="Precision" val1={comparison.xgboost.precision} val2={comparison.random_forest.precision} isWinner={comparison.xgboost.precision >= comparison.random_forest.precision} />
                <MetricRow label="Recall" val1={comparison.xgboost.recall} val2={comparison.random_forest.recall} isWinner={comparison.xgboost.recall >= comparison.random_forest.recall} />
                <MetricRow label="F1 Score" val1={comparison.xgboost.f1} val2={comparison.random_forest.f1} isWinner={comparison.xgboost.f1 >= comparison.random_forest.f1} />
              </div>
            </div>

            {/* Random Forest Card */}
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-slate-700/50 rounded-lg">
                  <Layers className="w-6 h-6 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-300">Random Forest</h3>
              </div>
              
              <div className="space-y-4">
                <MetricRow label="AUC-ROC" val1={comparison.random_forest.auc_roc} val2={comparison.xgboost.auc_roc} isWinner={comparison.random_forest.auc_roc > comparison.xgboost.auc_roc} />
                <MetricRow label="Accuracy" val1={comparison.random_forest.accuracy} val2={comparison.xgboost.accuracy} isWinner={comparison.random_forest.accuracy > comparison.xgboost.accuracy} />
                <MetricRow label="Precision" val1={comparison.random_forest.precision} val2={comparison.xgboost.precision} isWinner={comparison.random_forest.precision > comparison.xgboost.precision} />
                <MetricRow label="Recall" val1={comparison.random_forest.recall} val2={comparison.xgboost.recall} isWinner={comparison.random_forest.recall > comparison.xgboost.recall} />
                <MetricRow label="F1 Score" val1={comparison.random_forest.f1} val2={comparison.xgboost.f1} isWinner={comparison.random_forest.f1 > comparison.xgboost.f1} />
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Grid for Chart and Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Feature Importance Chart */}
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 shadow-xl flex flex-col">
          <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
            <Target className="w-5 h-5 text-brand-400" /> What drives credit decisions
          </h3>
          <p className="text-sm text-slate-400 mb-6 border-b border-slate-700 pb-4">
            Global feature permutation importance for the active XGBoost model.
          </p>
          <div className="flex-1 w-full min-h-[300px]">
             {chartData ? <Bar options={chartOptions} data={chartData} /> : <p className="text-slate-500">No data generated yet.</p>}
          </div>
        </div>

        {/* Confusion Matrix & Distribution */}
        <div className="space-y-6 flex flex-col">
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 shadow-xl flex flex-col">
            <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-brand-400" /> Active Model Test Matrix
            </h3>
            <p className="text-sm text-slate-400 mb-6 border-b border-slate-700 pb-4">
              Confusion Map showing true validation performance on the 20% holdout set.
            </p>
            
            {matrix ? (
              <div className="flex-1 flex flex-col justify-center gap-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* TN (Correctly Approved) Note: label 0 is Non-Default (low risk) */}
                  <div className="bg-emerald-500/10 border-l-4 border-emerald-500 rounded-lg p-5 flex flex-col items-center justify-center text-center shadow-inner">
                    <span className="text-3xl font-bold text-emerald-400">{matrix.tn}</span>
                    <span className="text-xs uppercase font-bold text-emerald-500/80 mt-1">Correctly Approved</span>
                    <span className="text-[10px] text-slate-400 mt-1">True Negative</span>
                  </div>
                  
                  {/* FP (False Approval) */}
                  <div className="bg-red-500/10 border-l-4 border-red-500 rounded-lg p-5 flex flex-col items-center justify-center text-center shadow-inner">
                    <span className="text-3xl font-bold text-red-500">{matrix.fp}</span>
                    <span className="text-xs uppercase font-bold text-red-500/80 mt-1">False Approval</span>
                    <span className="text-[10px] text-slate-400 mt-1">False Positive</span>
                  </div>
                  
                  {/* FN (Missed Approval) */}
                  <div className="bg-red-500/10 border-l-4 border-red-500 rounded-lg p-5 flex flex-col items-center justify-center text-center shadow-inner">
                    <span className="text-3xl font-bold text-red-500">{matrix.fn}</span>
                    <span className="text-xs uppercase font-bold text-red-500/80 mt-1">Missed Approval</span>
                    <span className="text-[10px] text-slate-400 mt-1">False Negative</span>
                  </div>
                  
                  {/* TP (Correctly Rejected) Note: label 1 is Default (High risk) */}
                  <div className="bg-emerald-500/10 border-l-4 border-emerald-500 rounded-lg p-5 flex flex-col items-center justify-center text-center shadow-inner">
                    <span className="text-3xl font-bold text-emerald-400">{matrix.tp}</span>
                    <span className="text-xs uppercase font-bold text-emerald-500/80 mt-1">Correctly Rejected</span>
                    <span className="text-[10px] text-slate-400 mt-1">True Positive</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-slate-500">No matrix generated yet.</p>
            )}
          </div>

          <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 shadow-xl flex flex-col flex-1">
            <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <Network className="w-5 h-5 text-brand-400" /> Default Rate Distribution
            </h3>
            <p className="text-sm text-slate-400 mb-6 border-b border-slate-700 pb-4">
              Distribution of Probability of Default (PD) across all scored applicants.
            </p>
            <div className="flex-1 w-full min-h-[160px]">
               {histData ? <Bar options={histOptions} data={histData} /> : <p className="text-slate-500">No applicants scored yet.</p>}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}

// Helper component for metric rows
function MetricRow({ label, val1, val2, isWinner }) {
  const valueClass = isWinner ? "text-emerald-400 font-bold" : "text-slate-300 font-medium";
  const barWidth = `${Math.min(val1 * 100, 100)}%`;
  
  return (
    <div>
      <div className="flex justify-between text-sm mb-1.5">
        <span className="text-slate-400 font-medium">{label}</span>
        <span className={valueClass}>{(val1 * 100).toFixed(1)}%</span>
      </div>
      <div className="w-full h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
        <div 
          className={`h-full ${isWinner ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-500'}`} 
          style={{ width: barWidth }}
        />
      </div>
    </div>
  );
}
