import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip
);

export default function ShapChart({ shapValues, finalScore }) {
  const [displayedData, setDisplayedData] = useState([]);
  
  // Full readable labels based on generated data features
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

  const keys = Object.keys(shapValues || {});
  const labels = keys.map(k => featureMap[k] || k);
  const rawValues = keys.map(k => shapValues[k]);
  
  // Distribute the score difference (finalScore - 0.5) proportionally 
  // to the SHAP log-odds to map them to the 0-1 probability scale roughly.
  // This is a visualization approximation for the waterfall chart.
  const baseScore = 0.5;
  const totalShift = finalScore - baseScore;
  const sumShap = rawValues.reduce((acc, val) => acc + val, 0);
  
  // If sumShap is 0, we can't distribute proportionally, just fallback
  const pValues = rawValues.map(v => sumShap !== 0 ? (v / sumShap) * totalShift : 0);
  
  // Calculate waterfall segments [start, end]
  const waterfallData = [];
  let currentP = baseScore;
  for (let i = 0; i < pValues.length; i++) {
    const nextP = currentP + pValues[i];
    waterfallData.push([currentP, nextP]);
    currentP = nextP;
  }

  useEffect(() => {
    // Reset data
    setDisplayedData(waterfallData.map(() => [0.5, 0.5]));

    let timerIds = [];
    waterfallData.forEach((val, index) => {
      const timer = setTimeout(() => {
        setDisplayedData(prev => {
          const newData = [...prev];
          newData[index] = val;
          return newData;
        });
      }, index * 120);
      timerIds.push(timer);
    });

    return () => {
      timerIds.forEach(clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finalScore]); // Re-run animation if finalScore changes (re-calculated)

  if (!shapValues) return null;

  // Colors: Green for Risk decreases (pValues < 0), Red for Risk increases (pValues > 0)
  const colors = pValues.map(v => v >= 0 ? '#ef4444' : '#10b981'); // red-500, emerald-500

  const data = {
    labels,
    datasets: [
      {
        label: 'Impact on Default Risk',
        data: displayedData,
        backgroundColor: colors,
        borderWidth: 1,
        borderColor: colors.map(c => c === '#ef4444' ? '#991b1b' : '#047857'), // darker borders
        borderRadius: 4,
      },
    ],
  };

  // Create an arbitrary horizontal line plugin instead of chartjs-plugin-annotation for simplicity
  const baselinePlugin = {
    id: 'baseline',
    beforeDraw: (chart) => {
      const { ctx, chartArea: { left, right }, scales: { y } } = chart;
      const yPos = y.getPixelForValue(0.5);
      
      ctx.save();
      ctx.beginPath();
      ctx.setLineDash([5, 5]);
      ctx.moveTo(left, yPos);
      ctx.lineTo(right, yPos);
      ctx.lineWidth = 1;
      ctx.strokeStyle = '#94a3b8'; // slate-400
      ctx.stroke();
      
      ctx.restore();
    }
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 300,
    },
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'How this score was built — feature by feature',
        color: '#f8fafc', // slate-50
        font: {
          size: 16,
          family: "'Inter', sans-serif",
          weight: 'bold'
        },
        padding: { bottom: 20 }
      },
      tooltip: {
        backgroundColor: '#1e293b',
        titleColor: '#f1f5f9',
        bodyColor: '#cbd5e1',
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: (ctx) => {
            const raw = pValues[ctx.dataIndex];
            const prefix = raw > 0 ? '+' : '';
            return `${prefix}${(raw * 100).toFixed(1)}% risk impact`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#cbd5e1', // slate-300
          maxRotation: 45,
          minRotation: 45,
          font: {
            size: 10,
            family: "'Inter', sans-serif"
          }
        }
      },
      y: {
        min: 0,
        max: 1,
        grid: {
          color: '#334155', // slate-700
        },
        ticks: {
          color: '#e2e8f0', // slate-200
          callback: function(value) {
            if (value === 0.5) return '0.5 (Baseline/Threshold)';
            return value.toFixed(1);
          },
          font: {
            size: 11,
            family: "'Inter', sans-serif"
          }
        }
      }
    }
  };

  return <Bar options={options} data={data} plugins={[baselinePlugin]} />;
}
