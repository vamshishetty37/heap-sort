/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import SummaryModule from './components/SummaryModule';
import StudentModule from './components/StudentModule';
import ExamModule from './components/ExamModule';
import { Bell, Search, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');

  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return <SummaryModule />;
      case 'students':
        return <StudentModule />;
      case 'exams':
        return <ExamModule />;
      case 'analytics':
        return (
          <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center border border-zinc-800">
              <span className="text-4xl text-zinc-700">📊</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Advanced Analytics</h3>
              <p className="text-zinc-500 max-w-xs mx-auto">This module is currently being integrated with VTU centralized data servers.</p>
            </div>
          </div>
        );
      default:
        return <SummaryModule />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-blue-500/30 selection:text-blue-900 flex">
      {/* Sidebar Navigation */}
      <Sidebar currentTab={currentTab} setTab={setCurrentTab} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto overflow-x-hidden">
        {/* Top Header */}
        <header className="h-16 bg-[#003366] text-white flex items-center justify-between px-8 shrink-0 border-b-4 border-[#FFD700] sticky top-0 z-40 shadow-md">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-white rounded flex items-center justify-center font-bold text-[#003366] text-lg">S</div>
            <h1 className="text-lg font-semibold tracking-tight">Engineering Management Portal</h1>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
              <input 
                type="text" 
                placeholder="Universal Search..." 
                className="bg-[#004080] border border-white/20 rounded pl-10 pr-4 py-1.5 text-xs text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-white/40"
              />
            </div>
            
            <div className="flex items-center gap-3">
              <button className="relative p-2 text-white/80 hover:text-white transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-green-400 rounded-full border-2 border-[#003366]"></span>
              </button>
              <div className="h-8 w-px bg-white/10 mx-2" />
              <button className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <div className="text-right flex flex-col justify-center">
                  <span className="text-xs font-bold text-white block leading-tight">Dr. S. K. Murthy</span>
                  <span className="text-[10px] text-white/60 block uppercase font-mono tracking-tighter">Registrar (Admin)</span>
                </div>
                <div className="w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                  <User className="w-5 h-5 text-white/80" />
                </div>
              </button>
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <main className="flex-1 p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Algorithm Indicator */}
        <footer className="p-4 border-t border-slate-200 flex justify-between items-center bg-white px-8">
           <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Algorithm: </span>
              <span className="text-[10px] font-mono text-blue-700 font-bold uppercase bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">MAX-HEAP (O(n log n))</span>
           </div>
           <p className="text-[10px] font-mono text-slate-400">© 2024 ENGINEERING MANAGEMENT SYSTEM. VERSION 2.4.1-STABLE</p>
        </footer>
      </div>
    </div>
  );
}

