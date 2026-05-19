/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LayoutDashboard, Users, Calendar, BarChart3, Settings } from 'lucide-react';
import { motion } from 'motion/react';

interface SidebarProps {
  currentTab: string;
  setTab: (tab: string) => void;
}

export default function Sidebar({ currentTab, setTab }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'students', label: 'Student Records', icon: Users },
    { id: 'exams', label: 'Exam Schedule', icon: Calendar },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <div className="w-64 bg-slate-800 border-r border-slate-700 flex flex-col h-screen sticky top-0 overflow-hidden shadow-2xl">
      <div className="p-6 bg-slate-900/50 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded flex items-center justify-center font-bold text-white text-xl shadow-inner border border-blue-400/20">
            S
          </div>
          <div>
            <h1 className="font-bold text-slate-100 text-sm uppercase tracking-widest leading-tight">University</h1>
            <p className="text-slate-500 text-[10px] font-mono uppercase font-bold">Portal v2.4</p>
          </div>
        </div>
      </div>

      <div className="px-4 pt-6 pb-2 text-[10px] uppercase tracking-wider font-bold text-slate-500">University Records</div>
      <nav className="flex-1 px-4 py-2 space-y-1">
        {menuItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              id={`nav-${item.id}`}
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 group ${
                isActive 
                  ? 'bg-slate-700 text-white shadow-sm ring-1 ring-white/10 border-l-4 border-blue-500' 
                  : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200'
              }`}
            >
              <item.icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'group-hover:text-blue-300'}`} />
              <span className="font-semibold text-sm">{item.label}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
              )}
            </button>
          );
        })}
      </nav>

      <div className="px-6 py-4 bg-slate-900/30 text-[10px] text-slate-500 border-t border-slate-700/50">
        <p className="font-mono">Processing: Active</p>
        <p className="font-mono mt-0.5 italic">Max-Heap Logic Engaged</p>
      </div>

      <div className="p-4 border-t border-slate-700">
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-slate-500 hover:text-slate-300 transition-colors">
          <Settings className="w-4 h-4" />
          <span className="font-semibold text-sm text-left">Admin Console</span>
        </button>
      </div>
    </div>
  );
}
