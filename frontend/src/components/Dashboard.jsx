import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Users, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

const API_BASE = 'http://127.0.0.1:8000/api';

export default function Dashboard({ onNewApplicant }) {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplicants();
  }, []);

  const fetchApplicants = async () => {
    try {
      const res = await axios.get(`${API_BASE}/applicants`);
      setApplicants(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 750) return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
    if (score >= 600) return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
    return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
  };

  const getScoreIcon = (score) => {
    if (score >= 750) return <CheckCircle className="w-4 h-4" />;
    if (score >= 600) return <Clock className="w-4 h-4" />;
    return <AlertTriangle className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-2 border-financial-500 border-t-transparent animate-spin"></div>
        <p className="mt-4 text-slate-400 animate-pulse">Loading alternative credit data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-1">Applicant Intelligence</h1>
          <p className="text-slate-400 text-sm">Review recently processed alternative credit profiles.</p>
        </div>
        <button 
          onClick={onNewApplicant}
          className="flex items-center gap-2 px-4 py-2 bg-financial-600 hover:bg-financial-500 transition-colors rounded-lg font-medium text-sm text-white shadow-lg shadow-financial-500/20"
        >
          <Users className="w-4 h-4" />
          <span>New Profile</span>
        </button>
      </div>

      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden backdrop-blur-xl shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/80 border-b border-slate-700/50 text-xs uppercase tracking-wider text-slate-400">
                <th className="px-6 py-4 font-medium">Applicant Name</th>
                <th className="px-6 py-4 font-medium text-center">Score</th>
                <th className="px-6 py-4 font-medium">Evaluated Metrics</th>
                <th className="px-6 py-4 font-medium">Processed Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {applicants.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-slate-500">
                    No applicants processed yet. Start by adding a new profile.
                  </td>
                </tr>
              ) : (
                applicants.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
                          {app.name.charAt(0)}
                        </div>
                        <span className="font-medium text-slate-200">{app.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-sm font-semibold ${getScoreColor(app.credit_score)}`}>
                        {getScoreIcon(app.credit_score)}
                        {app.credit_score}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        <span className="px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider rounded-md bg-slate-700/50 text-slate-300 border border-slate-600/50">
                          {app.upi_transactions_monthly} UPI Tx
                        </span>
                        <span className="px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider rounded-md bg-slate-700/50 text-slate-300 border border-slate-600/50">
                          {app.late_utility_payments} Late
                        </span>
                        <span className="px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider rounded-md bg-slate-700/50 text-slate-300 border border-slate-600/50">
                          {(app.income_stability_index * 10).toFixed(1)}/10 Stability
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                      {new Date(app.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
