import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import ScoreApplicant from './pages/ScoreApplicant';
import Insights from './pages/Insights';
import AiAssistant from './components/AiAssistant';

function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen bg-[var(--bg)] text-[var(--text)] overflow-hidden">
        <Sidebar />
        
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/score" element={<ScoreApplicant />} />
            <Route path="/insights" element={<Insights />} />
          </Routes>
        </main>
        
        <AiAssistant />
      </div>
    </BrowserRouter>
  );
}

export default App;
