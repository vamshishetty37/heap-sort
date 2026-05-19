/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Exam, SortField } from '../types';
import { BRANCHES, INITIAL_EXAMS, COURSES } from '../constants';
import { heapSort } from '../lib/heapSort';
import { Search, Plus, Calendar as CalendarIcon, MapPin, BookOpen, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function ExamModule() {
  const [exams, setExams] = useState<Exam[]>(INITIAL_EXAMS);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [conflict, setConflict] = useState<string | null>(null);

  const checkConflict = (hall: string, date: string, time: string) => {
    const existing = exams.find(e => e.hall === hall && e.date === date && e.time === time);
    return existing ? `Conflict: Hall ${hall} is already booked for ${existing.subjectCode} at this time.` : null;
  };

  const processedExams = useMemo(() => {
    let filtered = exams.filter(e => 
      e.subjectName.toLowerCase().includes(search.toLowerCase()) ||
      e.subjectCode.toLowerCase().includes(search.toLowerCase()) ||
      e.branch.toLowerCase().includes(search.toLowerCase())
    );

    return heapSort(filtered, (a, b) => {
      let valA = a[sortField as keyof Exam] || '';
      let valB = b[sortField as keyof Exam] || '';

      if (typeof valA === 'string') {
        return sortOrder === 'asc' 
          ? valA.localeCompare(valB as string) 
          : (valB as string).localeCompare(valA);
      }
      return sortOrder === 'asc' 
        ? (valA as number) - (valB as number) 
        : (valB as number) - (valA as number);
    });
  }, [exams, search, sortField, sortOrder]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Examination Coordination</h2>
          <p className="text-slate-500 text-sm">Logistical management for semester-end assessment cycles.</p>
        </div>
        <div className="flex gap-3">
           <button 
            className="bg-white hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all border border-slate-200 shadow-sm font-semibold text-sm"
          >
            <span>Generate Schedule PDF</span>
          </button>
          <button 
            onClick={() => setShowScheduleModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 transition-all shadow-md font-semibold text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Authorize New Shift</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {processedExams.map((exam, idx) => (
            <motion.div
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: idx * 0.05 }}
              key={exam.id}
              className="bg-white border border-slate-200 rounded-xl p-6 hover:border-blue-400 transition-all group relative shadow-sm hover:shadow-md"
            >
              <div className="absolute top-0 right-0 p-4">
                 <span className="bg-slate-100 text-slate-600 border border-slate-200 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
                    {exam.branch} / S{exam.semester}
                 </span>
              </div>
              
              <div className="space-y-5">
                <div className="space-y-1">
                  <p className="text-blue-600 font-mono text-[10px] uppercase font-bold tracking-widest">{exam.subjectCode}</p>
                  <h3 className="text-slate-800 font-bold text-lg leading-tight group-hover:text-blue-600 transition-colors">{exam.subjectName}</h3>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div className="flex items-center gap-2.5 text-slate-600 text-[13px] font-medium">
                    <CalendarIcon className="w-4 h-4 text-slate-400" />
                    <span>{new Date(exam.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-slate-600 text-[13px] font-medium">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>{exam.time}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-slate-600 text-[13px] font-medium">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span>Hall {exam.hall}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-slate-600 text-[13px] font-medium">
                    <BookOpen className="w-4 h-4 text-slate-400" />
                    <span>{exam.duration}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-between items-center bg-slate-50/50 -mx-6 -mb-6 px-6 py-3 rounded-b-xl mt-4">
                   <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="text-slate-500 text-[11px] font-bold uppercase tracking-tighter">Status: Authorized</span>
                   </div>
                   <button className="text-blue-600 text-xs font-bold hover:underline">Manage</button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

       <div className="bg-slate-800 text-white p-5 rounded-xl flex items-start gap-5 shadow-inner">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg border border-blue-400/20">
             <CalendarIcon className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="text-white font-bold text-sm tracking-tight capitalize">Advanced Logic Interface</h4>
            <p className="text-slate-400 text-xs mt-1 leading-relaxed">The system is currently using a <strong>Max-Heap</strong> structure to resolve scheduling conflicts and prioritize foundation courses. Records are maintained in O(log n) complexity for insertions.</p>
          </div>
          <div className="text-[10px] uppercase font-mono font-bold text-slate-500 bg-slate-900 px-2 py-1 rounded">Engine: v2.4.1</div>
       </div>

      <AnimatePresence>
        {showScheduleModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-200 w-full max-w-lg rounded-xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="text-xl font-bold text-slate-800 tracking-tight">Schedule New Exam</h3>
                <button onClick={() => { setShowScheduleModal(false); setConflict(null); }} className="text-slate-400 hover:text-slate-600 text-2xl">&times;</button>
              </div>
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.target as HTMLFormElement;
                  const formData = new FormData(form);
                  const hall = formData.get('hall') as string;
                  const date = formData.get('date') as string;
                  const time = formData.get('time') as string;
                  
                  const err = checkConflict(hall, date, time);
                  if (err) {
                    setConflict(err);
                    return;
                  }

                  const courseCode = formData.get('course') as string;
                  const course = COURSES.find(c => c.code === courseCode);

                  const newExam: Exam = {
                    id: Math.random().toString(36).substring(2, 9),
                    subjectCode: courseCode,
                    subjectName: course?.name || 'Unknown Subject',
                    date,
                    time,
                    duration: formData.get('duration') as string,
                    hall,
                    branch: formData.get('branch') as string,
                    semester: Number(formData.get('semester')),
                  };
                  setExams([...exams, newExam]);
                  setShowScheduleModal(false);
                  setConflict(null);
                }}
                className="p-8 space-y-5"
              >
                {conflict && (
                  <div className="bg-red-50 border border-red-200 p-3 rounded-lg flex items-center gap-3 text-red-700 text-xs font-bold animate-pulse">
                    <AlertCircle className="w-4 h-4" />
                    <span>{conflict}</span>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest px-1">Department</label>
                    <select name="branch" required className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all">
                      {BRANCHES.map(b => (
                        <option key={b.code} value={b.code}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest px-1">Semester</label>
                    <select name="semester" required className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all">
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                        <option key={s} value={s}>Semester {s}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest px-1">Course Code</label>
                  <select name="course" required className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all">
                    {COURSES.map(c => (
                      <option key={c.id} value={c.code}>{c.code} - {c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest px-1">Exam Date</label>
                    <input name="date" type="date" required className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest px-1">Start Time</label>
                    <select name="time" required className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all">
                      <option value="09:30 AM">09:30 AM</option>
                      <option value="02:00 PM">02:00 PM</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest px-1">Duration</label>
                    <input name="duration" required defaultValue="3 Hours" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest px-1">Exam Hall</label>
                    <input name="hall" required placeholder="LH-101" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all" />
                  </div>
                </div>
                <div className="pt-6 flex gap-4">
                  <button type="button" onClick={() => { setShowScheduleModal(false); setConflict(null); }} className="flex-1 px-4 py-3 border border-slate-200 text-slate-500 rounded-lg hover:bg-slate-50 transition-all font-bold text-xs uppercase tracking-widest">Cancel</button>
                  <button type="submit" className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-md font-bold text-xs uppercase tracking-widest">Authorize</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
