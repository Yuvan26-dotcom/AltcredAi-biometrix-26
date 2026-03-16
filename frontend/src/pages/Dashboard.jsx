import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Users, FileText, TrendingUp, AlertTriangle, ShieldCheck, Clock, BrainCircuit, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import ShapChart from '../components/ShapChart';

const API_BASE = 'http://localhost:8000';

export default function Dashboard() {
  const [data, setData] = useState({ stats: null, applicants: [] });
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const [shapData, setShapData] = useState(null);
  const [shapLoading, setShapLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, appRes] = await Promise.all([
        axios.get(`${API_BASE}/stats`).catch(() => ({ data: { total: 0, approved: 0, cold_start: 0, avg_score: 0 } })),
        axios.get(`${API_BASE}/applicants`).catch(() => ({ data: [] }))
      ]);
      
      const applicants = appRes.data;
      setData({
        stats: statsRes.data,
        applicants: applicants
      });
      
      if (applicants.length > 0) {
        handleRowClick(applicants[0]);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = async (app) => {
    setSelectedApp(app);
    setShapLoading(true);
    try {
      // Re-score to get SHAP and decision reason
      const features = {
        upi_txn_per_month: app.upi_txn_per_month || 0,
        bill_payment_rate: app.bill_payment_rate || 0,
        income_stability_score: app.income_stability_score || 0,
        monthly_spend_variance: app.monthly_spend_variance || 0,
        cash_flow_ratio: app.cash_flow_ratio || 0,
        digital_wallet_usage: app.digital_wallet_usage || 0,
        aadhaar_linked_txns: app.aadhaar_linked_txns || 0,
        jandhan_account_active: app.jandhan_account_active || 0,
        kirana_digital_payments: app.kirana_digital_payments || 0,
        recharge_frequency: app.recharge_frequency || 0,
        govt_scheme_beneficiary: app.govt_scheme_beneficiary || 0,
        self_help_group_member: app.self_help_group_member || 0
      };
      
      const res = await axios.post(`${API_BASE}/score`, features);
      setShapData(res.data);
    } catch (err) {
      console.error('Error fetching SHAP data for applicant:', err);
    } finally {
      setShapLoading(false);
    }
  };

  const getRiskBadge = (label) => {
    switch (label) {
      case 'Low Risk':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Medium Risk':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'High Risk':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-500 border-t-transparent"></div>
      </div>
    );
  }

  const { stats, applicants } = data;

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Platform Overview</h1>
          <p className="text-slate-400 mt-1">Real-time alternative credit intelligence metrics.</p>
        </div>
        <Link 
          to="/score"
          className="bg-brand-600 hover:bg-brand-500 text-white px-5 py-2.5 rounded-lg shadow-lg shadow-brand-500/20 font-medium transition-all flex items-center gap-2"
        >
          <Users className="w-4 h-4" />
          Score New Applicant
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* LEFT COLUMN (60%) */}
        <div className="w-full lg:w-[60%] space-y-8">
          {/* 4 Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <MetricCard 
              title="Total Applications" 
              value={stats?.total || applicants.length || 0} 
              icon={<FileText className="w-6 h-6 text-brand-400" />} 
            />
            <MetricCard 
              title="Approved (Low Risk)" 
              value={stats?.approved || applicants.filter(a => a.risk_label === 'Low Risk').length || 0} 
              icon={<ShieldCheck className="w-6 h-6 text-emerald-400" />} 
            />
            <MetricCard 
              title="Cold-Start Count" 
              value={stats?.cold_start || '0'} 
              subtitle={`${stats?.this_week_count || 0} applicants · ${stats?.cold_start_approval_rate || 0}% approved`}
              icon={<Users className="w-6 h-6 text-indigo-400" />} 
            />
            <MetricCard 
              title="Avg Risk Score" 
              value={stats?.avg_score ? stats.avg_score.toFixed(2) : '0.00'} 
              icon={<TrendingUp className="w-6 h-6 text-orange-400" />} 
            />
          </div>

          {/* Recent Applicants Table */}
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl overflow-hidden backdrop-blur-xl shadow-2xl">
            <div className="p-6 border-b border-slate-700/50 bg-slate-800/80">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Clock className="w-5 h-5 text-brand-400" /> Recent Scoring Log
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900/50 text-xs uppercase tracking-wider text-slate-400">
                    <th className="px-6 py-4 font-semibold">Applicant Name</th>
                    <th className="px-6 py-4 font-semibold text-center">Score</th>
                    <th className="px-6 py-4 font-semibold text-center">PD %</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {applicants.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center text-slate-500">
                        No applicants scored yet. <Link to="/score" className="text-brand-400 hover:underline">Process your first one.</Link>
                      </td>
                    </tr>
                  ) : (
                    applicants.map((app, idx) => {
                      const isSelected = selectedApp?.id === app.id && app.id !== undefined; // If id is undefined, use index if necessary, but DB returns id
                      const rowKey = app.id || idx;
                      // Fallback logic in case DB is just reset and IDs are missing
                      const isSelectedFallback = (!selectedApp?.id && selectedApp?.name === app.name && selectedApp?.created_at === app.created_at);
                      const active = isSelected || isSelectedFallback;
                      
                      const isColdStart = app.aadhaar_linked_txns <= 2 && app.jandhan_account_active === 0;
                      return (
                        <tr 
                          key={rowKey} 
                          onClick={() => handleRowClick(app)}
                          className={`cursor-pointer transition-all ${active ? 'bg-brand-500/10 border-l-2 border-brand-500' : 'hover:bg-slate-800/60 border-l-2 border-transparent'}`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span className="text-white font-medium">{app.name || `Applicant #${idx + 1}`}</span>
                              {isColdStart && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                                  COLD-START
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-500 mt-1">
                              {app.created_at ? new Date(app.created_at).toLocaleString() : 'Just now'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center font-bold font-mono text-lg text-slate-300">
                            {app.risk_score?.toFixed(3) || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center font-bold font-mono text-lg">
                            {app.risk_score ? (
                              <span className={app.risk_score < 0.35 ? 'text-emerald-500' : app.risk_score <= 0.65 ? 'text-yellow-500' : 'text-red-500'}>
                                {(app.risk_score * 100).toFixed(1)}%
                              </span>
                            ) : (
                              <span className="text-slate-500">N/A</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full border text-xs font-bold ${getRiskBadge(app.risk_label)}`}>
                              {app.risk_label || 'Unknown'}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (40%) */}
        <div className="w-full lg:w-[40%] space-y-6">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 shadow-xl sticky top-6">
            <h2 className="text-lg font-bold flex items-center gap-2 mb-6 text-white pb-4 border-b border-slate-700/50">
              <BrainCircuit className="w-5 h-5 text-brand-400" /> Decision Explainer
            </h2>
            
            {shapLoading ? (
               <div className="flex flex-col items-center justify-center py-24 text-center">
                 <Activity className="w-8 h-8 text-brand-500 animate-spin mb-4" />
                 <p className="text-sm text-slate-400">Loading AI reasoning...</p>
               </div>
            ) : !selectedApp || !shapData ? (
               <div className="flex flex-col items-center justify-center py-24 text-center">
                 <FileText className="w-12 h-12 text-slate-700 mb-4" />
                 <p className="text-sm text-slate-500">Select an applicant to view explainability data.</p>
               </div>
            ) : (
               <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                 {/* Profile Card */}
                 <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-5 grid grid-cols-2 gap-4 shadow-inner">
                   <div className="col-span-2 flex items-center justify-between border-b border-slate-800 pb-3 mb-1">
                     <div>
                       <h3 className="font-bold text-white text-lg">{selectedApp.name}</h3>
                       <p className="text-xs text-slate-400 mt-1">
                         {selectedApp.created_at ? new Date(selectedApp.created_at).toLocaleString() : 'Just now'}
                       </p>
                     </div>
                     <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getRiskBadge(selectedApp.risk_label)}`}>
                       {selectedApp.risk_label}
                     </span>
                   </div>
                   
                   <div className="bg-slate-800/80 rounded-lg p-3 border border-slate-700/50 flex flex-col items-center justify-center shadow-sm">
                     <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">Risk Score</span>
                     <div className={`text-2xl font-black font-mono tracking-tighter ${selectedApp.risk_label === 'High Risk' ? 'text-red-500' : 'text-emerald-500'}`}>
                       {shapData.risk_score ? shapData.risk_score.toFixed(3) : selectedApp.risk_score.toFixed(3)}
                     </div>
                   </div>

                   <div className="bg-slate-800/80 rounded-lg p-3 border border-slate-700/50 flex flex-col items-center justify-center shadow-sm">
                     <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">Probability of Default</span>
                     <div className={`text-2xl font-black font-mono tracking-tighter ${
                        (shapData.risk_score || selectedApp.risk_score) < 0.35 ? 'text-emerald-500' :
                        (shapData.risk_score || selectedApp.risk_score) <= 0.65 ? 'text-yellow-500' :
                        'text-red-500'
                     }`}>
                       {shapData.risk_score ? (shapData.risk_score * 100).toFixed(1) : (selectedApp.risk_score * 100).toFixed(1)}%
                     </div>
                   </div>
                 </div>

                 {/* Callout Box */}
                 <div className="border-l-4 border-brand-500 bg-brand-500/10 p-4 rounded-r-xl shadow-md">
                   <p className="text-sm text-slate-300 leading-relaxed font-medium">
                     {shapData.decision_reason}
                   </p>
                 </div>

                 {/* SHAP Chart */}
                 <div className="pt-2">
                    <div className="w-full h-[320px]">
                      <ShapChart shapValues={shapData.shap_values} finalScore={shapData.risk_score} />
                    </div>
                 </div>
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, subtitle, icon }) {
  return (
    <div className="bg-slate-800/50 border border-slate-700/50 p-6 rounded-2xl relative overflow-hidden shadow-lg group hover:border-brand-500/30 transition-colors">
      <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
        {React.cloneElement(icon, { className: 'w-24 h-24' })}
      </div>
      <div className="flex items-center justify-between mb-4 relative z-10">
        <h3 className="text-sm font-medium text-slate-400">{title}</h3>
        <div className="p-2 bg-slate-900 rounded-lg border border-slate-700">
          {icon}
        </div>
      </div>
      <div className="relative z-10">
        <div className="text-3xl font-bold text-white">{value}</div>
        {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}
