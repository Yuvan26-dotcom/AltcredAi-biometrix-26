import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Activity, Network } from 'lucide-react';

export default function Sidebar() {
  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-900/50 backdrop-blur-md flex flex-col hidden md:flex">
      <div className="p-6 border-b border-slate-800 flex items-center gap-3">
        <div className="p-2 bg-brand-500/10 rounded-lg">
          <Activity className="w-6 h-6 text-brand-500" />
        </div>
        <span className="font-bold text-xl tracking-tight text-white">
          AltCredAI
        </span>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${
              isActive 
                ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`
          }
        >
          <LayoutDashboard className="w-5 h-5" />
          Dashboard
        </NavLink>

        <NavLink
          to="/score"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${
              isActive 
                ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`
          }
        >
          <Users className="w-5 h-5" />
          Score Applicant
        </NavLink>

        <NavLink
          to="/insights"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${
              isActive 
                ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`
          }
        >
          <Network className="w-5 h-5" />
          Model Insights
        </NavLink>
      </nav>
      
      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
          <p className="text-xs text-slate-400 text-center">
            Hackathon Build <br/> <span className="text-brand-400 font-semibold">Credit-Vision_Biometrix '26</span>
          </p>
        </div>
      </div>
    </aside>
  );
}
