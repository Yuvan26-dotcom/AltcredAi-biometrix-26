import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Sidebar() {
  return (
    <aside className="w-[220px] bg-[var(--bg)] border-r border-[#1e1e1e] flex-col hidden md:flex h-full">
      <div className="p-6 pb-8 border-b border-[#1e1e1e]/50">
        <div className="font-syne font-[800] text-xl tracking-tight text-[var(--text)]">
          AltCred<span className="text-[var(--orange)]">AI</span>
        </div>
        <div className="font-dm text-[10px] tracking-widest text-[var(--text3)] uppercase mt-1">
          Credit Intelligence
        </div>
      </div>

      <nav className="flex-1 px-4 py-8 space-y-1">
        {[
          { path: '/', label: 'Dashboard' },
          { path: '/score', label: 'Score Applicant' },
          { path: '/insights', label: 'Model Insights' }
        ].map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `relative flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-150 font-dm text-[13px] ${
                isActive 
                  ? 'text-[var(--text)]' 
                  : 'text-[var(--text3)] hover:text-[var(--text2)]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className="flex items-center justify-center w-4 h-4">
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="w-1 h-1 rounded-full bg-[var(--orange)]"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </div>
                {item.label}
                {isActive && (
                  <motion.div
                    layoutId="nav-border"
                    className="absolute left-0 top-0 bottom-0 w-[2px] bg-[var(--orange)] rounded-r-md"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>
      
      <div className="p-4 border-t border-[#1e1e1e]/50">
        <div className="bg-[#161616] p-4 rounded-xl">
          <div className="flex justify-between items-center mb-2">
            <span className="font-mono text-[11px] text-[var(--orange)]">XGBoost v2.1</span>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--green)] animate-[pulse_2s_ease-in-out_infinite]"></div>
              <span className="font-syne text-[9px] uppercase tracking-wider text-[var(--green)]">Active</span>
            </div>
          </div>
          <div className="w-full h-[2px] bg-[#252525] rounded-full mb-2 overflow-hidden">
            <motion.div 
              className="h-full bg-[var(--orange)]" 
              initial={{ width: 0 }}
              animate={{ width: '97.6%' }}
              transition={{ duration: 1, delay: 0.5 }}
            />
          </div>
          <p className="font-mono text-[10px] text-[var(--text2)]">97.6% AUC-ROC</p>
        </div>
        
        <div className="mt-6 text-center">
            <p className="font-dm text-[9px] text-[var(--text3)] tracking-wider">Blueprints 2026 · Biometrix'26</p>
        </div>
      </div>
    </aside>
  );
}
