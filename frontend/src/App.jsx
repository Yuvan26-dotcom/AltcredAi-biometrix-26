import React from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import ScoreApplicant from './pages/ScoreApplicant';
import Insights from './pages/Insights';
import { Activity } from 'lucide-react';

function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen bg-slate-900 text-slate-100 overflow-hidden">
        <Sidebar />
        
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/score" element={<ScoreApplicant />} />
            <Route path="/insights" element={<Insights />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
