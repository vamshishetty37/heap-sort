/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { BRANCHES, INITIAL_STUDENTS, INITIAL_EXAMS, COURSES } from '../constants';
import { Award, BarChart3, GraduationCap, ShieldCheck, Users } from 'lucide-react';
import { motion } from 'motion/react';

export default function AnalyticsModule() {
  // Department mapping: selected department filter
  const [selectedDept, setSelectedDept] = useState<string>('ALL');

  // Calculates stats dynamically based on the selected department filter
  const filteredData = useMemo(() => {
    // Dropdown update logic: Filters the student records to match selected department or ALL
    const students = selectedDept === 'ALL' 
      ? INITIAL_STUDENTS 
      : INITIAL_STUDENTS.filter(s => s.branch === selectedDept);

    const totalStudents = students.length;
    
    const avgCgpa = totalStudents > 0 
      ? Number((students.reduce((sum, s) => sum + s.cgpa, 0) / totalStudents).toFixed(2))
      : 0.00;

    const highestCgpa = totalStudents > 0
      ? Math.max(...students.map(s => s.cgpa))
      : 0.00;

    const eligibleCount = students.filter(s => s.cgpa >= 6.5).length;
    const eligibilityRate = totalStudents > 0
      ? Math.round((eligibleCount / totalStudents) * 100)
      : 0;

    return {
      totalStudents,
      avgCgpa,
      highestCgpa,
      eligibilityRate,
    };
  }, [selectedDept]);

  // Aggregate statistics per department for charting visualizations
  // This aggregates both standard streams and the newly introduced "Cyber Security" dept.
  const deptSummaryData = useMemo(() => {
    return BRANCHES.map(b => {
      const studentsInDept = INITIAL_STUDENTS.filter(s => s.branch === b.code);
      const studentCount = studentsInDept.length;
      const averageCgpa = studentCount > 0
        ? Number((studentsInDept.reduce((sum, s) => sum + s.cgpa, 0) / studentCount).toFixed(2))
        : 0.0;

      return {
        code: b.code,
        name: b.name,
        count: studentCount,
        averageCgpa: averageCgpa,
      };
    }).filter(item => item.count > 0 || item.code === 'CY'); // Keep active departments or cybersecurity
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Institutional Analytics</h2>
          <p className="text-slate-500 mt-1">Real-time academic performance models and registry indexes.</p>
        </div>
        
        {/* Department Dropdown Filter */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Focus Intake:</label>
          <select 
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg px-4 py-2 text-xs font-bold text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 cursor-pointer transition-all"
          >
            <option value="ALL">All Departments</option>
            {BRANCHES.map(b => (
              <option key={b.code} value={b.code}>{b.name} ({b.code})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Enrolled Count */}
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm relative overflow-hidden group hover:border-blue-300 transition-all">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Enrolled Size</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-2">{filteredData.totalStudents}</h3>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg border border-blue-100">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-slate-400 text-[10px] mt-4 uppercase font-semibold">Active registered catalog</p>
        </div>

        {/* Card 2: Avg CGPA */}
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm relative overflow-hidden group hover:border-emerald-300 transition-all">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Performance (Avg CGPA)</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-2">{filteredData.avgCgpa.toFixed(2)}</h3>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <p className="text-slate-400 text-[10px] mt-4 uppercase font-semibold">Overall collective index</p>
        </div>

        {/* Card 3: Top Grade */}
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm relative overflow-hidden group hover:border-purple-300 transition-all">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Highest Grade Point</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-2">{filteredData.highestCgpa.toFixed(2)}</h3>
            </div>
            <div className="p-3 bg-purple-50 text-purple-600 rounded-lg border border-purple-100">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <p className="text-slate-400 text-[10px] mt-4 uppercase font-semibold">Intake ceiling scores</p>
        </div>

        {/* Card 4: Clear Rates */}
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm relative overflow-hidden group hover:border-orange-300 transition-all">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Eligibility Clear Rate</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-2">{filteredData.eligibilityRate}%</h3>
            </div>
            <div className="p-3 bg-orange-50 text-orange-600 rounded-lg border border-orange-100">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <p className="text-slate-400 text-[10px] mt-4 uppercase font-semibold">Passing criteria benchmarks</p>
        </div>
      </div>

      {/* Visual Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart A: Student Distribution */}
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-slate-800 font-bold text-md">Student Distribution by Department</h4>
              <p className="text-slate-400 text-xs mt-0.5">Aggregated enrollment volumes representing departmental capacity.</p>
            </div>
            <BarChart3 className="w-5 h-5 text-slate-400" />
          </div>

          <div className="space-y-4 pt-4">
            {deptSummaryData.map((dept, idx) => {
              // Calculate width percentage relative to max enrolled
              const maxCount = Math.max(...deptSummaryData.map(d => d.count), 1);
              const widthPct = (dept.count / maxCount) * 100;

              return (
                <div key={dept.code} className="space-y-1.5 animate-fade-in">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-700 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 bg-blue-600 rounded-full" />
                      {dept.name} ({dept.code})
                    </span>
                    <span className="text-slate-500 font-mono">{dept.count} Students</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50 relative shadow-inner">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${widthPct}%` }}
                      transition={{ duration: 0.8, delay: idx * 0.05 }}
                      className={`h-full rounded-full ${
                        dept.code === 'CY' 
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600' 
                          : 'bg-blue-500'
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart B: Performance Index */}
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-slate-800 font-bold text-md">Stream Performance Index (Avg CGPA)</h4>
              <p className="text-slate-400 text-xs mt-0.5">Average grades comparing performance curves. Highlight: Cyber Security.</p>
            </div>
            <GraduationCap className="w-5 h-5 text-slate-400" />
          </div>

          <div className="space-y-4 pt-4">
            {deptSummaryData.map((dept, idx) => {
              // Calculate CGPA relative width out of 10.0
              const widthPct = (dept.averageCgpa / 10) * 100;

              return (
                <div key={dept.code} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-700 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
                      {dept.name} ({dept.code})
                    </span>
                    <span className="text-emerald-700 font-mono font-bold">{dept.averageCgpa > 0 ? dept.averageCgpa.toFixed(2) : 'N/A'}</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50 relative shadow-inner">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${widthPct}%` }}
                      transition={{ duration: 0.8, delay: idx * 0.05 }}
                      className={`h-full rounded-full ${
                        dept.code === 'CY' 
                          ? 'bg-gradient-to-r from-emerald-500 to-green-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]' 
                          : 'bg-emerald-400'
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
