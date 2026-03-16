import React, { useState } from 'react';
import axios from 'axios';
import ShapChart from './ShapChart';
import { ArrowLeft, User, Activity, AlertCircle, TrendingUp, CheckCircle, Percent } from 'lucide-react';

const API_BASE = 'http://127.0.0.1:8000/api';

export default function ApplicantForm({ onComplete }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    upi_transactions_monthly: 50,
    late_utility_payments: 0,
    income_stability_index: 0.5,
    essential_spending_ratio: 0.5,
    savings_rate: 0.1
  });

  const handleChange = (e) => {
    let { name, value } = e.target;
    // Keep strictly numeric values
    if (name !== 'name') {
      value = parseFloat(value);
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/score`, formData);
      setResult(res.data);
    } catch (err) {
      console.error(err);
      alert('Error scoring applicant. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    const score = result.applicant.credit_score;
    let riskTier = 'High Risk';
    let riskColor = 'text-rose-500 bg-rose-500/10 border-rose-500/20';
    
    if (score >= 750) {
      riskTier = 'Low Risk';
      riskColor = 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
    } else if (score >= 600) {
      riskTier = 'Medium Risk';
      riskColor = 'text-amber-500 bg-amber-500/10 border-amber-500/20';
    }

    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <button 
          onClick={() => setResult(null)} 
          className="text-slate-400 hover:text-white flex items-center gap-2 text-sm font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Reset Form
        </button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Score Summary Card */}
          <div className="md:col-span-1 bg-slate-800/80 border border-slate-700/50 p-6 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden text-center shadow-xl">
            <div className={`absolute top-0 right-0 left-0 h-1 ${riskColor.split(' ')[0].replace('text-', 'bg-')}`}></div>
            <div className="p-3 bg-slate-900 rounded-full mb-4 shadow-inner border border-slate-700">
              <User className="w-8 h-8 text-slate-400" />
            </div>
            <h2 className="text-xl font-bold">{result.applicant.name}</h2>
            <p className="text-sm text-slate-400 mb-6">AltCredAI Decision Output</p>
            
            <div className="flex flex-col items-center relative z-10 w-full mb-4">
              <div className="text-6xl font-black tracking-tighter bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent drop-shadow-sm">
                {score}
              </div>
              <div className="text-xs font-semibold text-slate-500 mt-1 tracking-widest uppercase">/ 900</div>
            </div>

            <div className={`mt-2 px-4 py-1.5 rounded-full border text-sm font-bold ${riskColor}`}>
              {riskTier}
            </div>
          </div>

          {/* Explainability Card */}
          <div className="md:col-span-2 bg-slate-800/80 border border-slate-700/50 p-6 rounded-2xl shadow-xl">
            <h3 className="font-semibold text-lg flex items-center gap-2 mb-1">
              <Activity className="w-5 h-5 text-financial-400" /> Explainability Report
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              SHAP Impact Values: Shows exactly why the model scored {result.applicant.name} this way. 
              <span className="text-emerald-400">Green</span> pushes score up, <span className="text-rose-400">Red</span> pushes score down.
            </p>
            <div className="h-64 w-full relative">
               <ShapChart shapValues={result.shap_values} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 sm:p-8 shadow-2xl">
        <h2 className="text-2xl font-bold tracking-tight mb-2 flex items-center gap-2">
          New Applicant Signal Ingestion
        </h2>
        <p className="text-slate-400 text-sm mb-8">
          Input alternative data signals. Our AI uses these vectors instead of CIBIL score to generate a fair credit assessment.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-300 ml-1">Full Legal Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-4 w-4 text-slate-500" />
              </div>
              <input 
                type="text" required name="name"
                value={formData.name} onChange={handleChange}
                className="block w-full pl-10 bg-slate-900/50 border border-slate-700 rounded-lg focus:ring-2 focus:ring-financial-500 focus:border-financial-500 py-2.5 text-sm transition-all"
                placeholder="Rahul Kumar"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-medium text-slate-300 ml-1 flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5 text-financial-400" /> UPI Tx Volume/Mo
                </label>
                <span className="text-xs font-bold text-financial-400 bg-financial-500/10 px-2 py-0.5 rounded">{formData.upi_transactions_monthly}</span>
              </div>
              <input 
                type="range" name="upi_transactions_monthly" min="0" max="500"
                value={formData.upi_transactions_monthly} onChange={handleChange}
                className="w-full accent-financial-500"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-medium text-slate-300 ml-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-400" /> Late Utility Payments
                </label>
                <span className="text-xs font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded">{formData.late_utility_payments}</span>
              </div>
              <input 
                type="range" name="late_utility_payments" min="0" max="15"
                value={formData.late_utility_payments} onChange={handleChange}
                className="w-full accent-rose-500"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-medium text-slate-300 ml-1 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Income Stability
                </label>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">{(formData.income_stability_index).toFixed(2)}</span>
              </div>
              <input 
                type="range" name="income_stability_index" min="0" max="1" step="0.05"
                value={formData.income_stability_index} onChange={handleChange}
                className="w-full accent-emerald-500"
              />
              <p className="text-[10px] text-slate-500 ml-1">0=Highly Irregular, 1=Stable Salary</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-medium text-slate-300 ml-1 flex items-center gap-1">
                  <Percent className="w-3.5 h-3.5 text-blue-400" /> Essential Spend Ratio
                </label>
                <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">{(formData.essential_spending_ratio).toFixed(2)}</span>
              </div>
              <input 
                type="range" name="essential_spending_ratio" min="0" max="1" step="0.05"
                value={formData.essential_spending_ratio} onChange={handleChange}
                className="w-full accent-blue-500"
              />
              <p className="text-[10px] text-slate-500 ml-1">Ratio of total spend on rent/food/bills</p>
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <div className="flex justify-between">
                <label className="text-sm font-medium text-slate-300 ml-1 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-indigo-400" /> Monthly Savings Rate
                </label>
                <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">{(formData.savings_rate * 100).toFixed(0)}%</span>
              </div>
              <input 
                type="range" name="savings_rate" min="0" max="0.5" step="0.01"
                value={formData.savings_rate} onChange={handleChange}
                className="w-full accent-indigo-500"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-700/50 flex justify-end">
            <button 
              type="submit" disabled={loading}
              className="px-6 py-2.5 bg-financial-600 hover:bg-financial-500 text-white text-sm font-semibold rounded-lg shadow-lg shadow-financial-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Activity className="w-4 h-4 animate-spin" /> Processing AI...
                </>
              ) : (
                <>Generate Alt-Credit Score</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
