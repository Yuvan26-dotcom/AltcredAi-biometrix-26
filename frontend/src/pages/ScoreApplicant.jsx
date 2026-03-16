import React, { useState } from 'react';
import axios from 'axios';
import { ArrowLeft, BrainCircuit, Activity, Save, User, Zap } from 'lucide-react';
import ShapChart from '../components/ShapChart';
import { Link } from 'react-router-dom';

const API_BASE = 'http://localhost:8000';

const PERSONAS = [
  {
    id: 1,
    name: 'Meera (Gig Worker)',
    avatar: 'MR',
    color: 'emerald',
    tagline: 'Delivery worker, no CIBIL score',
    features: {
      upi_txn_per_month: 85,
      bill_payment_rate: 0.94,
      income_stability_score: 0.71,
      monthly_spend_variance: 3200,
      cash_flow_ratio: 1.3,
      digital_wallet_usage: 78,
      aadhaar_linked_txns: 0,
      jandhan_account_active: 0,
      kirana_digital_payments: 15,
      recharge_frequency: 10,
      govt_scheme_beneficiary: 1,
      self_help_group_member: 1
    },
    story: "Meera has 85 UPI transactions/month and pays 94% of bills on time — but banks rejected her because she has no CIBIL score. AltCredAI sees the full picture."
  },
  {
    id: 2,
    name: 'Suresh (Street Vendor)',
    avatar: 'SK',
    color: 'brand', // orange
    tagline: 'Kirana shop owner, cash-heavy',
    features: {
      upi_txn_per_month: 22,
      bill_payment_rate: 0.61,
      income_stability_score: 0.48,
      monthly_spend_variance: 8900,
      cash_flow_ratio: 0.9,
      digital_wallet_usage: 31,
      aadhaar_linked_txns: 8,
      jandhan_account_active: 1,
      kirana_digital_payments: 25,
      recharge_frequency: 6,
      govt_scheme_beneficiary: 1,
      self_help_group_member: 0
    },
    story: "Suresh runs a cash-heavy Kirana shop. Traditional models struggle with his income variance, but his steady supplier payments show he is a reliable borrower."
  },
  {
    id: 3,
    name: 'Vijay (Irregular Income)',
    avatar: 'VN',
    color: 'red',
    tagline: 'Daily wage worker, inconsistent payments',
    features: {
      upi_txn_per_month: 8,
      bill_payment_rate: 0.31,
      income_stability_score: 0.22,
      monthly_spend_variance: 15000,
      cash_flow_ratio: 0.5,
      digital_wallet_usage: 12,
      aadhaar_linked_txns: 2,
      jandhan_account_active: 0,
      kirana_digital_payments: 5,
      recharge_frequency: 2,
      govt_scheme_beneficiary: 0,
      self_help_group_member: 0
    },
    story: "Vijay's erratic income and low bill payment rate (31%) present high default risks. AltCredAI flags this early to prevent predatory lending cycles."
  }
];

export default function ScoreApplicant() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [saveStatus, setSaveStatus] = useState(null); // null, 'loading', 'success', 'error'
  const [activeStory, setActiveStory] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    upi_txn_per_month: 50,
    bill_payment_rate: 0.8,
    income_stability_score: 0.7,
    monthly_spend_variance: 5000,
    cash_flow_ratio: 1.2,
    digital_wallet_usage: 40,
    aadhaar_linked_txns: 15,
    jandhan_account_active: 0,
    kirana_digital_payments: 10,
    recharge_frequency: 5,
    govt_scheme_beneficiary: 0,
    self_help_group_member: 0
  });

  const handleChange = (e) => {
    let { name, value } = e.target;
    if (name !== 'name') value = parseFloat(value);
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePersonaClick = async (persona) => {
    const newData = { name: persona.name, ...persona.features };
    setFormData(newData);
    setActiveStory(persona.story);
    
    // Auto submit
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/score`, persona.features);
      setResult({ ...response.data, applicantName: persona.name });
      setSaveStatus(null);
    } catch (err) {
      console.error(err);
      alert('Error connecting to ML scoring engine.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActiveStory(null); // Clear story if manual submission
    setLoading(true);
    try {
      const { name, ...features } = formData;
      const response = await axios.post(`${API_BASE}/score`, features);
      setResult({ ...response.data, applicantName: name });
      setSaveStatus(null);
    } catch (err) {
      console.error(err);
      alert('Error connecting to ML scoring engine.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaveStatus('loading');
    try {
      await axios.post(`${API_BASE}/applicants`, {
        ...formData,
        name: result.applicantName || 'Anonymous',
        risk_score: result.risk_score,
        risk_label: result.risk_label
      });
      setSaveStatus('success');
    } catch (err) {
      console.error(err);
      setSaveStatus('error');
    }
  };

  const resetForm = () => {
    setResult(null);
    setActiveStory(null);
    setFormData({
      name: '',
      upi_txn_per_month: 50,
      bill_payment_rate: 0.8,
      income_stability_score: 0.7,
      monthly_spend_variance: 5000,
      cash_flow_ratio: 1.2,
      digital_wallet_usage: 40,
      aadhaar_linked_txns: 15,
      jandhan_account_active: 0,
      kirana_digital_payments: 10,
      recharge_frequency: 5,
      govt_scheme_beneficiary: 0,
      self_help_group_member: 0
    });
  }

  if (result) {
    const isHighRisk = result.risk_label === 'High Risk';
    const badgeColor = isHighRisk 
      ? 'bg-red-500/10 text-red-500 border-red-500/20' 
      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    const decisionColor = isHighRisk ? 'text-red-500' : 'text-emerald-500';
    const decisionText = isHighRisk ? 'DECLINED' : 'APPROVED';

    // Find best and worst signals
    let topRedFeature = null;
    let topRedValue = -Infinity;
    let topGreenFeature = null;
    let topGreenValue = Infinity;

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

    if (result.shap_values) {
      Object.entries(result.shap_values).forEach(([k, v]) => {
        if (v > topRedValue) { topRedValue = v; topRedFeature = k; }
        if (v < topGreenValue) { topGreenValue = v; topGreenFeature = k; }
      });
    }
    
    // Calculate approximate % impacts since we just want a nice string summary
    const sumShap = Object.values(result.shap_values || {}).reduce((acc, val) => acc + val, 0);
    const totalShift = result.risk_score - 0.5;
    const greenImpact = sumShap !== 0 ? Math.abs((topGreenValue / sumShap) * totalShift * 100) : 0;
    const redImpact = sumShap !== 0 ? Math.abs((topRedValue / sumShap) * totalShift * 100) : 0;

    return (
      <div className="max-w-5xl mx-auto space-y-6 animate-in slide-in-from-bottom-8 duration-700 fade-in zoom-in-95">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <button 
            onClick={() => setResult(null)}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Editor
          </button>
          
          <div className="flex items-center gap-3">
            <input 
              type="text"
              value={result.applicantName || ''}
              onChange={(e) => setResult(prev => ({...prev, applicantName: e.target.value}))}
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-brand-500 outline-none w-48"
              placeholder="Applicant Name"
            />
            <button
              onClick={handleSave}
              disabled={saveStatus === 'success' || saveStatus === 'loading'}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                saveStatus === 'success' 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-500/20'
              }`}
            >
              {saveStatus === 'loading' ? <Activity className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saveStatus === 'success' ? 'Saved' : 'Save Applicant'}
            </button>
          </div>
        </div>

        {activeStory && (
          <div className="bg-brand-500/10 border-l-4 border-brand-500 rounded-r-xl p-5 shadow-lg flex items-start gap-4">
            <div className="p-2 bg-brand-500/20 rounded-full mt-1">
              <Zap className="w-6 h-6 text-brand-400" />
            </div>
            <div>
              <h4 className="text-brand-400 font-bold mb-1">Human Impact Story</h4>
              <p className="text-slate-300 text-sm leading-relaxed">{activeStory}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Score Plaque */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden">
            <div className={`absolute top-0 right-0 left-0 h-1.5 ${isHighRisk ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
            
            <p className="text-slate-400 uppercase tracking-widest text-xs font-bold mb-4">AI Risk Assessment</p>
            
            <div className={`text-7xl font-black ${
                result.risk_score < 0.35 ? 'text-emerald-500 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]' :
                result.risk_score <= 0.65 ? 'text-yellow-500 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]' :
                'text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]'
              } font-mono tracking-tighter mb-2`}>
              {(result.risk_score * 100).toFixed(1)}%
            </div>
            <p className="text-sm font-bold text-white mb-1">Probability of Default</p>
            <p className="text-xs text-slate-500 font-medium mb-6">Based on XGBoost hybrid model</p>
            
            <div className={`px-4 py-1.5 rounded-full border text-xs font-bold uppercase tracking-wider mb-6 ${badgeColor}`}>
              {result.risk_label}
            </div>
            
            <div className={`text-3xl font-black tracking-tight mb-8 ${decisionColor}`}>
              {decisionText}
            </div>
            
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 w-full text-left">
              <div className="flex items-start gap-3">
                <BrainCircuit className="w-6 h-6 text-brand-400 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-white mb-1">Decision Reason</h4>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {result.decision_reason}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* SHAP Chart & Top Signals Area */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 shadow-xl flex-1 flex flex-col">
              <div className="flex-1 w-full min-h-[350px]">
                <ShapChart shapValues={result.shap_values} finalScore={result.risk_score} />
              </div>
            </div>

            {/* Top Signals Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex gap-4 items-center shadow-lg">
                <div className="p-3 bg-emerald-500/20 rounded-full text-emerald-400">
                  <ArrowLeft className="w-5 h-5 -rotate-90" />
                </div>
                <div>
                  <p className="text-xs text-emerald-500/80 font-bold uppercase tracking-wider mb-1">Best Signal</p>
                  <p className="text-sm text-emerald-100"><span className="font-bold text-white">{featureMap[topGreenFeature] || topGreenFeature}</span> → pushed score down by {(greenImpact).toFixed(1)}%</p>
                </div>
              </div>
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex gap-4 items-center shadow-lg">
                <div className="p-3 bg-red-500/20 rounded-full text-red-400">
                  <ArrowLeft className="w-5 h-5 rotate-90" />
                </div>
                <div>
                  <p className="text-xs text-red-500/80 font-bold uppercase tracking-wider mb-1">Biggest Risk</p>
                  <p className="text-sm text-red-100"><span className="font-bold text-white">{featureMap[topRedFeature] || topRedFeature}</span> → pushed score up by {(redImpact).toFixed(1)}%</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Evaluate Applicant</h1>
        <p className="text-slate-400 mt-1">Input alternative financial vectors to generate a credit risk profile.</p>
      </div>

      {/* Demo Personas Section */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
          <Zap className="w-4 h-4 text-brand-400" /> Try a pre-built demo profile
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PERSONAS.map(p => {
            const colors = {
              emerald: 'border-l-emerald-500 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20',
              brand: 'border-l-brand-500 bg-brand-500/10 text-brand-400 hover:bg-brand-500/20',
              red: 'border-l-red-500 bg-red-500/10 text-red-500 hover:bg-red-500/20',
            };
            const theme = colors[p.color] || colors.brand;

            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handlePersonaClick(p)}
                className={`flex flex-col text-left p-4 rounded-xl border-l-4 border-y border-r border-slate-700/50 transition-all shadow-md group ${theme.split('hover:')[0]} hover:border-r-slate-600 hover:border-y-slate-600`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${theme.split('bg-')[0]} bg-slate-900 shadow-inner`}>
                    {p.avatar}
                  </div>
                  <span className="font-bold text-white text-sm group-hover:text-white transition-colors">{p.name}</span>
                </div>
                <p className="text-xs text-slate-400 leading-snug">
                  {p.tagline}
                </p>
                <div className="mt-4 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-white transition-colors">
                  Auto-fill & Score <ArrowLeft className="w-3 h-3 rotate-180" />
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-slate-800"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="px-3 bg-slate-900 text-sm text-slate-500 font-medium">or manual entry</span>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 bg-slate-800/20 rounded-2xl border border-slate-700/50 border-dashed">
          <Activity className="w-12 h-12 text-brand-500 animate-spin mb-4" />
          <h3 className="text-lg font-bold text-white">Crunching alternative data...</h3>
          <p className="text-slate-400 text-sm">Evaluating UPI patterns & income stability via AI.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 md:p-8 backdrop-blur-xl shadow-2xl transition-all">
          <div className="space-y-8">
            
            <div className="border-b border-slate-700/50 pb-6">
              <label className="block text-sm font-semibold text-slate-300 mb-2">Applicant Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input 
                  type="text" required name="name"
                  value={formData.name} onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-11 pr-4 text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all outline-none"
                  placeholder="Ex: Anjali Sharma"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-2">
              
              <InputSlider 
                label="UPI Txn / Month" 
                name="upi_txn_per_month" 
                value={formData.upi_txn_per_month} 
                onChange={handleChange} 
                min="0" max="200" 
                color="brand"
              />
              
              <InputSlider 
                label="Bill Payment Rate" 
                name="bill_payment_rate" 
                value={formData.bill_payment_rate} 
                onChange={handleChange} 
                min="0" max="1" step="0.01" 
                format={(v) => `${(v*100).toFixed(0)}%`}
                color="emerald"
              />
              
              <InputSlider 
                label="Income Stability Score" 
                name="income_stability_score" 
                value={formData.income_stability_score} 
                onChange={handleChange} 
                min="0" max="1" step="0.05" 
                color="blue"
              />
              
              <InputSlider 
                label="Monthly Spend Variance (₹)" 
                name="monthly_spend_variance" 
                value={formData.monthly_spend_variance} 
                onChange={handleChange} 
                min="500" max="20000" step="100" 
                color="red"
              />
              
              <InputSlider 
                label="Cash Flow Ratio" 
                name="cash_flow_ratio" 
                value={formData.cash_flow_ratio} 
                onChange={handleChange} 
                min="0" max="2" step="0.1" 
                color="purple"
              />
              
              <InputSlider 
                label="Digital Wallet Usage" 
                name="digital_wallet_usage" 
                value={formData.digital_wallet_usage} 
                onChange={handleChange} 
                min="0" max="100" 
                format={(v) => `${v}%`}
                color="cyan"
              />
              
              <InputSlider 
                label="Aadhaar Auth Txns" 
                name="aadhaar_linked_txns" 
                value={formData.aadhaar_linked_txns} 
                onChange={handleChange} 
                min="0" max="50" 
                color="brand"
                helperText="Total Aadhaar biometric authentications linked to POS or DBTs."
              />

              <InputSlider 
                label="Jan Dhan Account" 
                name="jandhan_account_active" 
                value={formData.jandhan_account_active} 
                onChange={handleChange} 
                min="0" max="1" 
                format={(v) => v === "1" || v === 1 ? 'Active' : 'Missing/Inactive'}
                color="emerald"
                helperText="Jan Dhan account active? Helps evaluate underbanked applicants."
              />

              <InputSlider 
                label="Kirana Digital Payments" 
                name="kirana_digital_payments" 
                value={formData.kirana_digital_payments} 
                onChange={handleChange} 
                min="0" max="30" 
                color="blue"
                helperText="Micro-payments (<₹100) at local stores show stable financial participation."
              />

              <InputSlider 
                label="Recharge Frequency" 
                name="recharge_frequency" 
                value={formData.recharge_frequency} 
                onChange={handleChange} 
                min="0" max="20" 
                color="red"
                helperText="Mobile top-ups per month. Tracks small-value discretionary spend."
              />

              <InputSlider 
                label="Govt Scheme Beneficiary" 
                name="govt_scheme_beneficiary" 
                value={formData.govt_scheme_beneficiary} 
                onChange={handleChange} 
                min="0" max="1" 
                format={(v) => v === "1" || v === 1 ? 'Yes' : 'No'}
                color="purple"
                helperText="Enrolled for PM-KISAN, PMJDY, or other DBTs."
              />

              <InputSlider 
                label="SHG Membership" 
                name="self_help_group_member" 
                value={formData.self_help_group_member} 
                onChange={handleChange} 
                min="0" max="1" 
                format={(v) => v === "1" || v === 1 ? 'Yes' : 'No'}
                color="cyan"
                helperText="Active member of a Self-Help Group. Strong signal for female rural lending."
              />

            </div>

            <div className="pt-6 border-t border-slate-700/50 flex justify-between items-center">
              <button
                type="button"
                onClick={resetForm}
                className="text-slate-400 hover:text-white text-sm font-medium transition-colors"
              >
                Clear Form
              </button>
              <button 
                type="submit" disabled={loading}
                className="bg-brand-600 hover:bg-brand-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-brand-500/25 transition-all text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                Generate Risk Score
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

function InputSlider({ label, name, value, onChange, min, max, step="1", format, color, helperText }) {
  const colorMap = {
    brand: 'accent-brand-500 text-brand-400 bg-brand-500/10',
    emerald: 'accent-emerald-500 text-emerald-400 bg-emerald-500/10',
    blue: 'accent-blue-500 text-blue-400 bg-blue-500/10',
    red: 'accent-red-500 text-red-400 bg-red-500/10',
    purple: 'accent-purple-500 text-purple-400 bg-purple-500/10',
    cyan: 'accent-cyan-500 text-cyan-400 bg-cyan-500/10',
  };
  
  const selectedTheme = colorMap[color] || colorMap.brand;
  const [accent, textColor, bgColor] = selectedTheme.split(' ');

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-slate-300">{label}</label>
        <div className={`px-2 py-1 rounded text-xs font-bold ${textColor} ${bgColor}`}>
          {format ? format(value) : value}
        </div>
      </div>
      <input 
        type="range" name={name} min={min} max={max} step={step}
        value={value} onChange={onChange}
        className={`w-full ${accent} h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer`}
      />
      {helperText && <p className="text-[10px] text-slate-500 italic mt-1">{helperText}</p>}
    </div>
  );
}
