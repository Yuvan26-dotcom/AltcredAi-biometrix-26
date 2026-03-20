import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import ShapChart from '../components/ShapChart';
import { Link } from 'react-router-dom';

const API_BASE = 'http://localhost:8000';

const PERSONAS = [
  {
    id: 1,
    name: 'Meera',
    avatar: 'MR',
    tagline: 'Delivery worker, no CIBIL score',
    features: { upi_txn_per_month: 85, bill_payment_rate: 0.94, income_stability_score: 0.71, monthly_spend_variance: 3200, cash_flow_ratio: 1.3, digital_wallet_usage: 78, aadhaar_linked_txns: 0, jandhan_account_active: 0, kirana_digital_payments: 15, recharge_frequency: 10, govt_scheme_beneficiary: 1, self_help_group_member: 1 },
    story: "Meera has 85 UPI transactions/month and pays 94% of bills on time — but banks rejected her because she has no CIBIL score. AltCredAI sees the full picture.",
    demoScore: 780
  },
  {
    id: 2,
    name: 'Suresh',
    avatar: 'SK',
    tagline: 'Kirana shop owner, cash-heavy',
    features: { upi_txn_per_month: 22, bill_payment_rate: 0.61, income_stability_score: 0.48, monthly_spend_variance: 8900, cash_flow_ratio: 0.9, digital_wallet_usage: 31, aadhaar_linked_txns: 8, jandhan_account_active: 1, kirana_digital_payments: 25, recharge_frequency: 6, govt_scheme_beneficiary: 1, self_help_group_member: 0 },
    story: "Suresh runs a cash-heavy Kirana shop. Traditional models struggle with his income variance, but his steady supplier payments show he is a reliable borrower.",
    demoScore: 610
  },
  {
    id: 3,
    name: 'Vijay',
    avatar: 'VN',
    tagline: 'Daily wage worker, inconsistent payments',
    features: { upi_txn_per_month: 8, bill_payment_rate: 0.31, income_stability_score: 0.22, monthly_spend_variance: 15000, cash_flow_ratio: 0.5, digital_wallet_usage: 12, aadhaar_linked_txns: 2, jandhan_account_active: 0, kirana_digital_payments: 5, recharge_frequency: 2, govt_scheme_beneficiary: 0, self_help_group_member: 0 },
    story: "Vijay's erratic income and low bill payment rate (31%) present high default risks. AltCredAI flags this early to prevent predatory lending cycles.",
    demoScore: 420
  }
];

export default function ScoreApplicant() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [saveStatus, setSaveStatus] = useState(null);
  const [activeStory, setActiveStory] = useState(null);
  
  const [upiId, setUpiId] = useState('');
  const [fetchingUpi, setFetchingUpi] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState('');
  const [fetchSuccessMsg, setFetchSuccessMsg] = useState('');
  const [rawTxns, setRawTxns] = useState(null);
  const [isValidUpi, setIsValidUpi] = useState(false);
  const [isTouchedUpi, setIsTouchedUpi] = useState(false);
  
  const handleUpiChange = (e) => {
    const val = e.target.value;
    setUpiId(val);
    if (!isTouchedUpi) setIsTouchedUpi(true);
    const validIds = ['meera@okaxis', 'suresh@okaxis', 'vijay@okaxis'];
    setIsValidUpi(validIds.includes(val.toLowerCase()));
  };
  
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
    setActiveStory(null);
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

  const handleFetchUpi = async () => {
    if (!isValidUpi) return;
    setFetchingUpi(true);
    setFetchSuccessMsg('');
    setRawTxns(null);
    setActiveStory(null);
    setResult(null);

    try {
      setLoadingPhase("Validating UPI ID...");
      await new Promise(r => setTimeout(r, 500));
      setLoadingPhase("Sending consent request to Account Aggregator...");
      await new Promise(r => setTimeout(r, 800));
      setLoadingPhase("Fetching 6 months of transaction history...");
      await new Promise(r => setTimeout(r, 800));

      const res = await axios.get(`${API_BASE}/fetch-upi-data?upi_id=${encodeURIComponent(upiId)}`);
      const fetchedData = res.data;
      
      const txnCount = fetchedData.FI?.Transactions?.totalCount || "347";
      setLoadingPhase(`Analysing ${txnCount} transactions...`);
      await new Promise(r => setTimeout(r, 900));
      
      const extractedFeatures = fetchedData.derivedFeatures || {};
      const newFeatures = {
        name: fetchedData.name || upiId.split('@')[0],
        upi_txn_per_month: extractedFeatures.upi_txn_per_month || 0,
        bill_payment_rate: extractedFeatures.bill_payment_rate || 0,
        income_stability_score: extractedFeatures.income_stability_score || 0,
        monthly_spend_variance: extractedFeatures.monthly_spend_variance || 0,
        cash_flow_ratio: extractedFeatures.cash_flow_ratio || 0,
        digital_wallet_usage: extractedFeatures.digital_wallet_usage || 0,
        aadhaar_linked_txns: extractedFeatures.aadhaar_linked_txns || 0,
        jandhan_account_active: extractedFeatures.jandhan_account_active || 0,
        kirana_digital_payments: extractedFeatures.kirana_digital_payments || 0,
        recharge_frequency: extractedFeatures.recharge_frequency || 0,
        govt_scheme_beneficiary: extractedFeatures.govt_scheme_beneficiary || 0,
        self_help_group_member: extractedFeatures.self_help_group_member || 0
      };

      setFormData(newFeatures);
      
      if (fetchedData.FI?.Transactions?.data) {
        setRawTxns({
           count: txnCount,
           data: fetchedData.FI.Transactions.data
        });
      }
      
      setFetchSuccessMsg(`Data fetched for ${fetchedData.upi_id || upiId} — 6 months of UPI history analysed`);
      
      setLoading(true);
      const { name, ...featuresToScore } = newFeatures;
      const scoreRes = await axios.post(`${API_BASE}/score`, featuresToScore);
      setResult({ ...scoreRes.data, applicantName: name });
      setSaveStatus(null);
    } catch (err) {
      console.error(err);
      alert("Error fetching AA data.");
    } finally {
      setFetchingUpi(false);
      setLoadingPhase('');
      setLoading(false);
    }
  };

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

  return (
    <div className="max-w-[1000px] mx-auto pb-20">
      <AnimatePresence mode="wait">
        {!result ? (
          <motion.div 
            key="input-form"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-12"
          >
            <div>
              <h1 className="font-syne text-4xl text-[var(--text)] tracking-tight">Evaluate Applicant</h1>
              <p className="font-dm text-[var(--text2)] mt-2">Input alternative financial vectors to generate a credit risk profile.</p>
            </div>

            {/* AA Fetch Section */}
            <div className="space-y-4 pt-4 border-t border-[var(--bg4)]">
              <h2 className="font-dm text-[11px] uppercase tracking-widest text-[var(--text3)]">Simulate Account Aggregator Flow</h2>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <input 
                    type="text" 
                    value={upiId}
                    onChange={handleUpiChange}
                    className="w-full bg-[var(--bg3)] border border-[var(--border)] rounded px-4 py-3 font-dm text-[14px] text-[var(--text)] focus:border-[var(--orange)] focus:outline-none transition-colors"
                    placeholder="Enter UPI ID (e.g. name@okaxis)"
                    disabled={fetchingUpi}
                  />
                  {isTouchedUpi && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 font-mono text-xs font-bold">
                       {isValidUpi ? <span className="text-[var(--green)]">VALID ✓</span> : <span className="text-[var(--red)]">INVALID ✕</span>}
                    </div>
                  )}
                </div>
                <button 
                  onClick={handleFetchUpi}
                  disabled={fetchingUpi || !isValidUpi}
                  className={`px-6 py-3 rounded font-syne font-[700] text-[13px] tracking-[0.05em] transition-all flex items-center justify-center min-w-[180px] ${
                    fetchingUpi || !isValidUpi 
                      ? 'bg-[var(--bg4)] text-[var(--text3)] cursor-not-allowed'
                      : 'bg-[var(--orange)] hover:bg-[#E55A1F] text-white hover:-translate-y-[1px]'
                  }`}
                >
                  {fetchingUpi ? 'CONNECTING...' : 'FETCH AA DATA'}
                </button>
              </div>
              <div className="flex justify-between items-start font-dm text-[11px] text-[var(--text3)]">
                <p>Fetches 6 months of mock UPI transaction graph data.</p>
                {isTouchedUpi && !isValidUpi && (
                  <p className="text-[var(--red)] font-semibold">Mock API only accepts valid demo IDs: meera@okaxis, suresh@okaxis, vijay@okaxis</p>
                )}
              </div>
              {fetchSuccessMsg && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="text-[12px] font-dm text-[var(--green)]">
                      {fetchSuccessMsg}
                  </motion.div>
              )}
            </div>

            {/* RAW Transactions Table (Temporary Display) */}
            {rawTxns && !loading && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                <h3 className="font-dm text-[11px] uppercase tracking-widest text-[var(--text3)] flex justify-between">
                  <span>Raw Txn Data Analyzed</span>
                  <span className="font-mono">{rawTxns.count} ROWS</span>
                </h3>
                <div className="bg-[var(--bg2)] rounded border border-[var(--border)] max-h-48 overflow-y-auto">
                   <table className="w-full text-left font-dm text-[12px]">
                       <thead className="bg-[var(--bg3)] sticky top-0 uppercase tracking-widest text-[10px] text-[var(--text3)]">
                           <tr>
                               <th className="px-4 py-2 font-medium">Date</th>
                               <th className="px-4 py-2 font-medium">Merchant</th>
                               <th className="px-4 py-2 font-medium">Type</th>
                               <th className="px-4 py-2 font-medium text-right">Amount</th>
                           </tr>
                       </thead>
                       <tbody className="divide-y divide-[var(--border)]">
                           {rawTxns.data.map((txn, idx) => (
                               <tr key={idx} className="hover:bg-[var(--bg3)] transition-colors text-[var(--text2)]">
                                   <td className="px-4 py-2">{txn.date}</td>
                                   <td className="px-4 py-2 text-[var(--text)]">{txn.merchant}</td>
                                   <td className="px-4 py-2">{txn.type}</td>
                                   <td className="px-4 py-2 text-right font-mono font-bold">₹{txn.amount}</td>
                               </tr>
                           ))}
                       </tbody>
                   </table>
                </div>
              </motion.div>
            )}

            {/* Personas */}
            <div className="space-y-4 pt-6 border-t border-[var(--bg4)]">
              <h2 className="font-dm text-[11px] uppercase tracking-widest text-[var(--text3)]">— OR START WITH A PROFILE</h2>
              <div className="flex flex-col gap-2">
                {PERSONAS.map(p => (
                  <button
                    key={p.id}
                    onClick={() => handlePersonaClick(p)}
                    className="group flex flex-col sm:flex-row sm:items-center justify-between w-full text-left py-4 sm:py-3 px-2 transition-transform hover:translate-x-1 border border-[var(--border)] sm:border-transparent rounded-lg sm:rounded-none mb-2 sm:mb-0"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-[2px] h-8 bg-[var(--orange)] rounded" />
                      <div className="w-8 h-8 rounded-full bg-[var(--bg3)] text-[var(--text)] flex items-center justify-center font-syne text-[11px] font-bold">
                        {p.avatar}
                      </div>
                      <div>
                        <div className="font-dm text-[14px] text-[var(--text)] group-hover:text-[var(--orange)] transition-colors">{p.name}</div>
                        <div className="font-dm text-[12px] text-[var(--text3)]">{p.tagline}</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6 mt-4 sm:mt-0 pl-12 sm:pl-0">
                      <div className="font-mono text-[14px] text-[var(--text2)] text-right w-[60px]">{p.demoScore}</div>
                      <div className="font-syne text-[12px] font-bold text-[var(--orange)] opacity-0 group-hover:opacity-100 transition-opacity">
                        Load profile →
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-10 pt-10 border-t border-[var(--bg4)]">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="w-10 h-10 rounded-full border-[3px] border-[var(--orange)] border-t-transparent animate-spin mb-6"></div>
                  <h3 className="font-syne font-bold text-xl text-[var(--text)] uppercase tracking-wider">Analysing Data Points</h3>
                  <p className="font-dm text-[var(--text2)] mt-2">Running XGBoost hybrid evaluation engine</p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="font-dm text-[11px] uppercase tracking-widest text-[var(--text3)] mb-4 block">Applicant Detail</label>
                    <input 
                      type="text" required name="name"
                      value={formData.name} onChange={handleChange}
                      className="w-full bg-transparent border-b-2 border-[var(--border2)] pb-4 font-syne text-3xl text-[var(--text)] placeholder:text-[var(--text3)] focus:border-[var(--orange)] focus:outline-none transition-colors"
                      placeholder="Applicant Name"
                    />
                  </div>

                  <div className="space-y-8 max-w-[600px]">
                    <InputSlider label="UPI Txn / Month" name="upi_txn_per_month" value={formData.upi_txn_per_month} onChange={handleChange} min="0" max="200" helperText="Total count of transactions on UPI per month" />
                    <InputSlider label="Bill Payment Rate" name="bill_payment_rate" value={formData.bill_payment_rate} onChange={handleChange} min="0" max="1" step="0.01" format={(v) => `${(v*100).toFixed(0)}%`} helperText="Ratio of fully paid utility bills vs due" />
                    <InputSlider label="Income Stability Score" name="income_stability_score" value={formData.income_stability_score} onChange={handleChange} min="0" max="1" step="0.05" helperText="0 to 1 index of recurring income regularity" />
                    <InputSlider label="Monthly Spend Variance (₹)" name="monthly_spend_variance" value={formData.monthly_spend_variance} onChange={handleChange} min="500" max="20000" step="100" />
                    <InputSlider label="Cash Flow Ratio" name="cash_flow_ratio" value={formData.cash_flow_ratio} onChange={handleChange} min="0" max="2" step="0.1" />
                    <InputSlider label="Digital Wallet Usage" name="digital_wallet_usage" value={formData.digital_wallet_usage} onChange={handleChange} min="0" max="100" format={(v) => `${v}%`} />
                    <InputSlider label="Aadhaar Auth Txns" name="aadhaar_linked_txns" value={formData.aadhaar_linked_txns} onChange={handleChange} min="0" max="50" helperText="Counts eKYC authentications for POS/DBT" />
                    <InputSlider label="Jan Dhan Account" name="jandhan_account_active" value={formData.jandhan_account_active} onChange={handleChange} min="0" max="1" format={(v) => v == 1 ? 'Yes' : 'No'} />
                    <InputSlider label="Kirana Digital Payments" name="kirana_digital_payments" value={formData.kirana_digital_payments} onChange={handleChange} min="0" max="30" helperText="Identified localized micro-payments <₹100" />
                    <InputSlider label="Recharge Frequency" name="recharge_frequency" value={formData.recharge_frequency} onChange={handleChange} min="0" max="20" />
                    <InputSlider label="Govt Scheme Beneficiary" name="govt_scheme_beneficiary" value={formData.govt_scheme_beneficiary} onChange={handleChange} min="0" max="1" format={(v) => v == 1 ? 'Yes' : 'No'} />
                    <InputSlider label="SHG Membership" name="self_help_group_member" value={formData.self_help_group_member} onChange={handleChange} min="0" max="1" format={(v) => v == 1 ? 'Yes' : 'No'} />
                  </div>

                  <div className="pt-8 flex">
                    <button 
                      type="submit" 
                      className="w-full h-[52px] bg-[var(--orange)] hover:bg-[#E55A1F] text-white rounded font-syne font-[700] text-[14px] tracking-[0.05em] transition-all hover:-translate-y-[1px] active:translate-y-0"
                    >
                      GENERATE RISK SCORE
                    </button>
                  </div>
                </>
              )}
            </form>
          </motion.div>
        ) : (
          <motion.div 
            key="result-view"
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="space-y-12 pb-10 max-w-[800px] mx-auto"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 group">
              <button 
                onClick={() => setResult(null)}
                className="font-dm text-[12px] text-[var(--text3)] group-hover:text-[var(--orange)] transition-colors flex items-center gap-2"
              >
                <span className="text-[var(--orange)] opacity-0 group-hover:opacity-100 transition-opacity">←</span> Edit Profile
              </button>
              
              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <select 
                  onChange={(e) => {
                    const SCORE_ANNOUNCE = {
                      english: (name, score, label) => `${name}'s credit risk score is ${score}. Risk classification: ${label}.`,
                      hindi: (name, score, label) => `${name} का क्रेडिट जोखिम स्कोर ${score} है। जोखिम वर्गीकरण: ${label}।`,
                      tamil: (name, score, label) => `${name} இன் கடன் ஆபத்து மதிப்பெண் ${score}. ஆபத்து வகைப்பாடு: ${label}.`,
                      telugu: (name, score, label) => `${name} యొక్క క్రెడిట్ రిస్క్ స్కోర్ ${score}. రిస్క్ వర్గీకరణ: ${label}.`,
                      kannada: (name, score, label) => `${name} ಅವರ ಕ್ರೆಡಿಟ್ ಅಪಾಯದ ಸ್ಕೋರ್ ${score}. ಅಪಾಯದ ವರ್ಗೀಕರಣ: ${label}.`,
                      malayalam: (name, score, label) => `${name} ന്റെ ക്രെഡിറ്റ് റിസ്ക് സ്കോർ ${score} ആണ്. റിസ്ക് വർഗ്ഗീകരണം: ${label}.`,
                      bengali: (name, score, label) => `${name} এর ক্রেডিট ঝুঁকি স্কোর হল ${score}। ঝুঁকি শ্রেণীবিভাগ: ${label}।`,
                      marathi: (name, score, label) => `${name} चा क्रेडिट जोखीम स्कोअर ${score} आहे. जोखीम वर्गीकरण: ${label}.`
                    };
                    const langKey = e.target.value;
                    const text = SCORE_ANNOUNCE[langKey]?.(result.applicantName || 'Applicant', ((result.risk_score * 100).toFixed(1)) + '%', result.risk_label) || SCORE_ANNOUNCE.english(result.applicantName || 'Applicant', ((result.risk_score * 100).toFixed(1)) + '%', result.risk_label);
                    import('../utils/tts').then(({ speakText }) => {
                      speakText(text, langKey);
                    });
                  }}
                  className="bg-transparent border border-[var(--border)] text-[var(--text2)] font-dm text-[11px] rounded px-2 py-1.5 outline-none cursor-pointer hover:border-[var(--orange)] transition-colors"
                >
                  <option value="" disabled selected>🔊 Read Aloud In...</option>
                  <option value="english">English</option>
                  <option value="hindi">Hindi</option>
                  <option value="tamil">Tamil</option>
                  <option value="telugu">Telugu</option>
                  <option value="kannada">Kannada</option>
                  <option value="malayalam">Malayalam</option>
                  <option value="bengali">Bengali</option>
                  <option value="marathi">Marathi</option>
                </select>

                <button
                  onClick={handleSave}
                  disabled={saveStatus === 'success' || saveStatus === 'loading'}
                  className="font-syne font-[700] text-[12px] tracking-[0.05em] px-4 py-2 border border-[var(--border)] rounded flex hover:bg-[var(--bg3)] transition-colors disabled:opacity-50"
                >
                  {saveStatus === 'loading' ? 'SAVING...' : saveStatus === 'success' ? 'SAVED' : 'SAVE APPLICANT'}
                </button>
              </div>
            </div>

            <div className="text-center space-y-4 pt-4">
              <h2 className="font-syne text-5xl text-[var(--text)]">{result.applicantName || 'Applicant'}</h2>
              <div className="font-dm text-[13px] uppercase tracking-widest" style={{ color: result.risk_label === 'High Risk' ? 'var(--red)' : result.risk_label === 'Medium Risk' ? 'var(--yellow)' : 'var(--green)' }}>
                {result.risk_label}
              </div>
            </div>

            <div className="bg-[var(--bg2)] p-12 rounded-[16px] text-center flex flex-col items-center justify-center">
               <div className="font-dm text-[11px] uppercase tracking-widest text-[var(--text3)] mb-4">Probability of Default</div>
               <div className="font-mono font-bold text-[80px] leading-none tracking-tighter" style={{ color: result.risk_label === 'High Risk' ? 'var(--red)' : result.risk_label === 'Medium Risk' ? 'var(--yellow)' : 'var(--green)' }}>
                 {(result.risk_score * 100).toFixed(1)}%
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-[var(--bg4)]">
              <div>
                <h3 className="font-dm text-[11px] uppercase tracking-widest text-[var(--text3)] mb-4">Decision Reason</h3>
                <p className="font-dm text-[15px] leading-relaxed text-[var(--text2)]">{result.decision_reason}</p>
                {activeStory && (
                  <div className="mt-6 p-4 bg-[var(--bg3)] rounded border-l-2 border-[var(--orange)]">
                    <div className="font-syne text-[11px] uppercase tracking-widest font-bold text-[var(--orange)] mb-2">Context</div>
                    <p className="font-dm text-[13px] text-[var(--text)]">{activeStory}</p>
                  </div>
                )}
              </div>
              
              <div>
                <h3 className="font-dm text-[11px] uppercase tracking-widest text-[var(--text3)] mb-4">Risk Factors</h3>
                <div className="bg-[var(--bg2)] p-6 rounded-[16px]">
                  <ShapChart shapValues={result.shap_values} finalScore={result.risk_score} />
                </div>
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function InputSlider({ label, name, value, onChange, min, max, step="1", format, helperText }) {
  return (
    <div className="flex flex-col gap-3 group">
      <div className="flex justify-between items-end">
        <div>
          <label className="font-dm text-[11px] uppercase tracking-widest text-[var(--text2)] group-hover:text-[var(--text)] transition-colors">{label}</label>
          {helperText && <p className="font-dm text-[10px] text-[var(--text3)] italic mt-1 max-w-[80%]">{helperText}</p>}
        </div>
        <div className="font-mono text-[13px] text-[var(--orange)] font-bold">
          {format ? format(value) : value}
        </div>
      </div>
      <input 
        type="range" name={name} min={min} max={max} step={step}
        value={value} onChange={onChange}
        className="form-slider w-full h-[2px] bg-[var(--bg4)] appearance-none cursor-pointer rounded-full outline-none"
      />
      <style dangerouslySetInnerHTML={{__html: `
        .form-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: var(--orange);
          cursor: pointer;
          border: none;
          box-shadow: none;
        }
        .form-slider::-moz-range-thumb {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: var(--orange);
          cursor: pointer;
          border: none;
          box-shadow: none;
        }
      `}} />
    </div>
  );
}
