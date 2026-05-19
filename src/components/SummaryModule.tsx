/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Student, Exam } from '../types';
import { INITIAL_STUDENTS, INITIAL_EXAMS } from '../constants';
import { Users, GraduationCap, Calendar, Clock, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';

export default function SummaryModule() {
  const stats = [
    { label: 'Total Students', value: INITIAL_STUDENTS.length, icon: Users, color: 'bg-blue-500' },
    { label: 'Upcoming Exams', value: INITIAL_EXAMS.length, icon: Calendar, color: 'bg-purple-500' },
    { label: 'Avg CGPA', value: '8.44', icon: GraduationCap, color: 'bg-emerald-500' },
    { label: 'Halls Occupied', value: '12', icon: Clock, color: 'bg-orange-500' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Institutional Overview</h2>
        <p className="text-slate-500 mt-1">Key performance indicators and academic controls for the current cycle.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={stat.label}
            className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm relative overflow-hidden group hover:border-blue-300 transition-all hover:shadow-md"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{stat.label}</p>
                <h3 className="text-3xl font-bold text-slate-800 mt-1">{stat.value}</h3>
              </div>
              <div className={`p-2.5 rounded-lg ${stat.color === 'bg-blue-500' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-slate-50 text-slate-600 border border-slate-100'}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1.5">
               <span className="text-green-600 text-[10px] font-bold">+12.4%</span>
               <span className="text-slate-400 text-[10px] uppercase font-bold tracking-tighter">vs previous cycle</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
           <div className="flex justify-between items-center">
              <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em]">Transaction Log</h3>
              <button className="text-blue-600 text-xs font-semibold hover:underline">View Global History</button>
           </div>
           <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden divide-y divide-slate-100">
              {[
                { type: 'ID_CREATE', msg: 'New student USN 1RV21CS102 added to registry', time: '2 mins ago' },
                { type: 'SCHED_MOD', msg: 'Exam schedule for 21CS42 updated successfully', time: '45 mins ago' },
                { type: 'SYS_REBUILD', msg: 'Heap Sort engine synchronized 42k records', time: '1 hour ago' },
                { type: 'SECURITY', msg: 'User Dr. Murthy accessed registrar level data', time: '3 hours ago' },
              ].map((log, i) => (
                <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_5px_rgba(59,130,246,0.5)]" />
                    <div>
                      <p className="text-slate-700 text-sm font-medium">{log.msg}</p>
                      <p className="text-slate-400 text-[10px] uppercase font-mono mt-0.5 tracking-tight font-bold">{log.type}</p>
                    </div>
                  </div>
                  <span className="text-slate-400 text-[10px] font-mono whitespace-nowrap">{log.time}</span>
                </div>
              ))}
           </div>
        </div>

        <div className="space-y-4">
           <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em]">Official Notices</h3>
           <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm space-y-6">
              <div className="flex gap-4">
                 <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                 <div>
                    <h4 className="text-slate-800 text-sm font-bold">IA Marks Submission</h4>
                    <p className="text-slate-500 text-xs mt-1 leading-relaxed">Internal assessment marks must be uploaded to the portal by the 25th of current month.</p>
                 </div>
              </div>
              <div className="flex gap-4">
                 <div className="w-2 h-2 bg-blue-600 rounded-full mt-1.5 shrink-0" />
                 <div>
                    <h4 className="text-slate-800 text-sm font-bold">Server Maintenance</h4>
                    <p className="text-slate-500 text-xs mt-1 leading-relaxed">Infrastructure will be under maintenance on Sunday between 12:00 AM and 04:00 AM.</p>
                 </div>
              </div>
              <button className="w-full bg-slate-800 hover:bg-slate-900 text-white text-[11px] font-bold py-3 rounded-lg border border-slate-700 transition-all shadow-sm">
                 Access Circular Archive
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
