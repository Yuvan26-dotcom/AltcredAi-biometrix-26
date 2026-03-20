import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import ShapChart from '../components/ShapChart';

const API_BASE = 'https://altcredai-biometrix-26.onrender.com';

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } }
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } }
};

function AnimatedCounter({ target }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    // ensure numeric target
    const targetNum = typeof target === 'string' ? parseFloat(target) : target;
    const isFloat = targetNum % 1 !== 0;
    
    if (isNaN(targetNum)) {
      setCount(target);
      return;
    }

    const duration = 1500; // ms
    const startTime = performance.now();

    const updateCounter = (currentTime) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1);
      
      // easeOutExpo
      const easing = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      
      const currentVal = start + (targetNum - start) * easing;
      
      if (isFloat) {
        setCount(currentVal.toFixed(2));
      } else {
        setCount(Math.floor(currentVal));
      }

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        setCount(isFloat ? targetNum.toFixed(2) : targetNum);
      }
    };

    requestAnimationFrame(updateCounter);
  }, [target]);

  return <span>{count}</span>;
}

function MetricCard({ title, value, subtitle }) {
  return (
    <motion.div 
      variants={fadeUp}
      className="bg-[var(--bg2)] rounded-[16px] p-6 transition-all duration-200 hover:scale-[1.005] relative overflow-hidden group"
    >
      <div className="absolute left-0 top-0 bottom-0 w-0 bg-[var(--orange)] transition-all duration-200 group-hover:w-[2px]"></div>
      <h3 className="font-dm text-[10px] uppercase tracking-widest text-[var(--text3)] mb-4">{title}</h3>
      <div className="font-mono text-4xl text-[var(--text)] mb-2">
        <AnimatedCounter target={value} />
      </div>
      {subtitle && <p className="font-dm text-xs text-[var(--text2)]">{subtitle}</p>}
    </motion.div>
  );
}

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

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this applicant?')) {
      try {
        await axios.delete(`${API_BASE}/applicants/${id}`);
        const updatedApplicants = data.applicants.filter(app => app.id !== id);
        setData(prev => ({ ...prev, applicants: updatedApplicants }));
        if (selectedApp?.id === id) {
          setSelectedApp(null);
          setShapData(null);
        }
        fetchData();
      } catch (err) {
        console.error('Error deleting applicant:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[var(--orange)] border-t-transparent animate-spin"></div>
      </div>
    );
  }

  const { stats, applicants } = data;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 8 }}
        transition={{ duration: 0.25 }}
        className="max-w-[1400px] mx-auto space-y-12"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="font-syne text-4xl text-[var(--text)] tracking-tight">Platform Overview</h1>
            <p className="font-dm text-[var(--text2)] mt-2">Real-time alternative credit intelligence metrics.</p>
          </div>
          <Link 
            to="/score"
            className="bg-[var(--orange)] hover:bg-[#E55A1F] text-white px-6 py-3 rounded-lg font-syne font-[700] text-[14px] tracking-[0.05em] transition-all hover:-translate-y-[1px] active:translate-y-0"
          >
            SCORE NEW APPLICANT
          </Link>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          {/* LEFT COLUMN */}
          <motion.div 
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="xl:col-span-7 space-y-8"
          >
            {/* Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <MetricCard 
                title="Total Applications" 
                value={stats?.total || applicants.length || 0} 
              />
              <MetricCard 
                title="Approved (Low Risk)" 
                value={stats?.approved || applicants.filter(a => a.risk_label === 'Low Risk').length || 0} 
              />
              <MetricCard 
                title="Cold-Start Count" 
                value={stats?.cold_start || '0'} 
                subtitle={`${stats?.this_week_count || 0} applicants · ${stats?.cold_start_approval_rate || 0}% approved`}
              />
              <MetricCard 
                title="Avg Risk Score" 
                value={stats?.avg_score ? stats.avg_score : 0} 
              />
            </div>

            {/* Recent Applicants Tabular List */}
            <motion.div variants={fadeUp}>
              <h2 className="font-dm text-[11px] uppercase tracking-widest text-[var(--text3)] mb-4 px-2">Recent Scoring Log</h2>
              
              <div className="overflow-x-auto pb-4 custom-scrollbar">
                <div className="space-y-1 min-w-[700px]">
                <div className="flex text-left font-dm text-[10px] uppercase tracking-widest text-[var(--text3)] px-4 py-2 border-b border-[var(--border)] mb-2">
                    <div className="w-[30%]">Applicant Name</div>
                    <div className="w-[20%] text-center">Score</div>
                    <div className="w-[25%] text-center">PD %</div>
                    <div className="w-[20%]">Status</div>
                    <div className="w-[5%] text-right"></div>
                </div>

                {applicants.length === 0 ? (
                  <div className="px-4 py-12 text-center text-[var(--text2)] font-dm italic">
                    No applicants scored yet. <Link to="/score" className="text-[var(--orange)] not-italic border-b border-[var(--orange)]/30 hover:border-[var(--orange)]">Process your first one.</Link>
                  </div>
                ) : (
                  applicants.map((app, idx) => {
                    const active = selectedApp?.id === app.id || (!selectedApp?.id && selectedApp?.name === app.name && selectedApp?.created_at === app.created_at);
                    
                    let riskColor = 'var(--text2)';
                    let riskDot = 'var(--text3)';
                    if (app.risk_label === 'Low Risk') {
                        riskColor = 'var(--green)';
                        riskDot = 'var(--green)';
                    } else if (app.risk_label === 'Medium Risk') {
                        riskColor = 'var(--yellow)';
                        riskDot = 'var(--yellow)';
                    } else if (app.risk_label === 'High Risk') {
                        riskColor = 'var(--red)';
                        riskDot = 'var(--red)';
                    }

                    const isColdStart = app.aadhaar_linked_txns <= 2 && app.jandhan_account_active === 0;

                    const initials = (app.name || `A${idx}`).split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

                    return (
                      <motion.div 
                        key={app.id || idx}
                        onClick={() => handleRowClick(app)}
                        className={`flex items-center px-4 py-3 rounded-xl cursor-pointer transition-colors group ${active ? 'bg-[rgba(255,107,43,0.04)]' : 'hover:bg-[rgba(255,107,43,0.02)]'}`}
                      >
                        <div className="w-[30%] flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[var(--bg3)] text-[var(--text)] flex items-center justify-center font-syne text-xs font-bold">
                            {initials}
                          </div>
                          <div>
                            <div className="font-dm text-[13px] font-[500] text-[var(--text)] flex items-center gap-2">
                                {app.name || `Applicant #${idx + 1}`}
                                {isColdStart && (
                                <span className="text-[9px] font-dm text-[var(--purple)] uppercase tracking-wider">
                                    [Cold-Start]
                                </span>
                                )}
                            </div>
                            <div className="text-[10px] text-[var(--text2)] font-dm mt-0.5">
                                {app.created_at ? new Date(app.created_at).toLocaleDateString(undefined, {month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'}) : 'Just now'}
                            </div>
                          </div>
                        </div>
                        <div className="w-[20%] text-center font-mono text-[12px] text-[var(--text2)]">
                          {app.risk_score?.toFixed(3) || 'N/A'}
                        </div>
                        <div className="w-[25%] flex justify-center">
                            <div className="flex flex-col items-center gap-1.5 w-[60px]">
                                <div className="font-mono text-[12px]" style={{ color: riskColor }}>
                                    {app.risk_score ? `${(app.risk_score * 100).toFixed(1)}%` : 'N/A'}
                                </div>
                                <div className="w-full h-[2px] bg-[var(--bg3)] rounded-full overflow-hidden">
                                    <div className="h-full rounded-full" style={{ width: `${(app.risk_score || 0) * 100}%`, backgroundColor: riskColor }}></div>
                                </div>
                            </div>
                        </div>
                        <div className="w-[20%]">
                          <span className="font-dm text-[11px] font-medium" style={{ color: riskColor }}>
                            <span className="mr-1.5 opacity-80" style={{ color: riskDot }}>●</span>
                            {app.risk_label || 'Unknown'}
                          </span>
                        </div>
                        <div className="w-[5%] text-right flex items-center justify-end gap-2">
                          <span className="text-[var(--orange)] font-mono text-[12px] opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                        </div>
                      </motion.div>
                    );
                  })
                )}
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* RIGHT COLUMN */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="xl:col-span-5 space-y-6"
          >
            <div className="sticky top-6 max-h-[calc(100vh-3rem)] overflow-y-auto custom-scrollbar pr-2 pb-6">
              <h2 className="font-dm text-[11px] uppercase tracking-widest text-[var(--text3)] mb-4">Decision Explainer</h2>
              
              {shapLoading ? (
                 <div className="bg-[var(--bg2)] rounded-[16px] p-8 flex flex-col items-center justify-center text-center">
                   <div className="w-6 h-6 rounded-full border-2 border-[var(--orange)] border-t-transparent animate-spin mb-4"></div>
                   <p className="font-dm text-sm text-[var(--text2)]">Loading AI reasoning...</p>
                 </div>
              ) : !selectedApp || !shapData ? (
                 <div className="bg-[var(--bg2)] rounded-[16px] p-8 flex flex-col items-center justify-center text-center border border-[var(--border)] border-dashed">
                   <p className="font-dm text-sm text-[var(--text2)]">Select an applicant to view explainability data.</p>
                 </div>
              ) : (
                 <motion.div 
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className="bg-[var(--bg2)] rounded-[16px] p-8"
                 >
                   <div className="flex justify-between items-start mb-8">
                     <div>
                       <h3 className="font-syne text-2xl text-[var(--text)]">{selectedApp.name || 'Applicant'}</h3>
                       <div className="font-dm text-[11px] font-medium mt-2" style={{ color: selectedApp.risk_label === 'High Risk' ? 'var(--red)' : selectedApp.risk_label === 'Medium Risk' ? 'var(--yellow)' : 'var(--green)' }}>
                            <span className="mr-1.5 opacity-80">●</span>
                            {selectedApp.risk_label}
                        </div>
                     </div>
                     <div className="text-right">
                        <div className="font-dm text-[10px] uppercase tracking-widest text-[var(--text3)] mb-1">Risk Score</div>
                        <div className="font-mono text-3xl text-[var(--text)]">
                            <AnimatedCounter target={shapData.risk_score ? shapData.risk_score.toFixed(3) : selectedApp.risk_score.toFixed(3)} />
                        </div>
                     </div>
                   </div>

                   {/* Callout Box */}
                   <div className="bg-[var(--bg)] p-5 rounded-lg border-l-2 border-[var(--orange)] mb-8">
                     <p className="font-dm text-[13px] text-[var(--text2)] leading-relaxed">
                       {shapData.decision_reason}
                     </p>
                   </div>

                   {/* SHAP Chart */}
                   <div>
                      <div className="font-dm text-[10px] uppercase tracking-widest text-[var(--text3)] mb-4">Feature Impact</div>
                      <div className="w-full">
                        <ShapChart shapValues={shapData.shap_values} finalScore={shapData.risk_score} />
                      </div>
                   </div>
                 </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
