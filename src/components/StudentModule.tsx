/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Student, SortField } from '../types';
import { BRANCHES, SEMESTERS, INITIAL_STUDENTS, COURSES } from '../constants';
import { heapSort } from '../lib/heapSort';
import { Search, Plus, ArrowUpDown, BookOpen, UserCheck, GraduationCap, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function StudentModule() {
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('usn');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'records' | 'registration'>('records');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  const selectedStudent = useMemo(() => 
    students.find(s => s.id === selectedStudentId), 
    [students, selectedStudentId]
  );

  // Filter and then sort using Heap Sort
  const processedStudents = useMemo(() => {
    let filtered = students.filter(s => 
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.usn.toLowerCase().includes(search.toLowerCase()) ||
      s.branch.toLowerCase().includes(search.toLowerCase())
    );

    const sorted = heapSort(filtered, (a, b) => {
      let valA = a[sortField as keyof Student];
      let valB = b[sortField as keyof Student];

      if (typeof valA === 'string') {
        return sortOrder === 'asc' 
          ? valA.localeCompare(valB as string) 
          : (valB as string).localeCompare(valA);
      }
      return sortOrder === 'asc' 
        ? (valA as number) - (valB as number) 
        : (valB as number) - (valA as number);
    });

    return sorted;
  }, [students, search, sortField, sortOrder]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Academic Services</h2>
          <p className="text-slate-500 text-sm">Registry management and active course enrollment systems.</p>
        </div>
        <div className="flex gap-2">
          <div className="bg-slate-100 p-1 rounded-lg flex gap-1">
             <button 
              onClick={() => setActiveTab('records')}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === 'records' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
             >
                Records
             </button>
             <button 
              onClick={() => setActiveTab('registration')}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === 'registration' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
             >
                Course Registration
             </button>
          </div>
          <button 
            id="btn-add-student"
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg flex items-center gap-2 transition-all shadow-sm font-semibold text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New Registry</span>
          </button>
        </div>
      </div>

      {activeTab === 'records' ? (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text"
                placeholder="Query by USN, Name or Department..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
              />
            </div>
            <button className="bg-slate-800 text-white text-xs px-4 py-2 rounded-md hover:bg-slate-900 transition-colors font-bold uppercase tracking-wider">
              Apply Heap Sort
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold uppercase text-slate-500 tracking-wider border-b border-slate-200">
                  <th 
                    className="px-6 py-4 cursor-pointer hover:text-blue-600 transition-colors"
                    onClick={() => toggleSort('usn')}
                  >
                    <div className="flex items-center gap-2 uppercase">USN (Identity) <ArrowUpDown className="w-3 h-3 text-slate-300" /></div>
                  </th>
                  <th 
                    className="px-6 py-4 cursor-pointer hover:text-blue-600 transition-colors"
                    onClick={() => toggleSort('name')}
                  >
                     <div className="flex items-center gap-2 uppercase">Legal Name <ArrowUpDown className="w-3 h-3 text-slate-300" /></div>
                  </th>
                  <th className="px-6 py-4 uppercase">Department</th>
                  <th 
                    className="px-6 py-4 cursor-pointer hover:text-blue-600 transition-colors"
                    onClick={() => toggleSort('semester')}
                  >
                    <div className="flex items-center gap-2 uppercase">Cycle <ArrowUpDown className="w-3 h-3 text-slate-300" /></div>
                  </th>
                  <th 
                    className="px-6 py-4 cursor-pointer hover:text-blue-600 transition-colors"
                    onClick={() => toggleSort('cgpa')}
                  >
                    <div className="flex items-center gap-2 uppercase">CGPA Score <ArrowUpDown className="w-3 h-3 text-slate-300" /></div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <AnimatePresence mode="popLayout">
                  {processedStudents.map((student) => (
                    <motion.tr 
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      id={`student-${student.usn}`}
                      key={student.id}
                      onClick={() => {
                        setSelectedStudentId(student.id);
                        setActiveTab('registration');
                      }}
                      className="group hover:bg-blue-50/30 transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4 font-mono text-blue-700 text-xs font-bold">{student.usn}</td>
                      <td className="px-6 py-4 text-slate-700 font-semibold text-sm">{student.name}</td>
                      <td className="px-6 py-4">
                        <span className="bg-slate-100 px-2.5 py-1 rounded text-[10px] font-bold text-slate-600 border border-slate-200 uppercase">
                          {student.branch}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-sm font-medium">Sem {student.semester}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden shadow-inner border border-slate-200/50">
                            <div 
                              className={`h-full rounded-full ${student.cgpa >= 8 ? 'bg-green-500' : student.cgpa >= 7 ? 'bg-blue-500' : 'bg-amber-500'}`} 
                              style={{ width: `${(student.cgpa / 10) * 100}%` }}
                            />
                          </div>
                          <span className="text-slate-800 font-bold font-mono text-sm">{student.cgpa.toFixed(2)}</span>
                          {student.cgpa >= 6.5 ? (
                            <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded-full text-[10px] font-bold border border-green-100">ELIGIBLE</span>
                          ) : (
                            <span className="bg-red-50 text-red-700 px-2 py-0.5 rounded-full text-[10px] font-bold border border-red-100">INELIGIBLE</span>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Student Selector / Info */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-slate-800 text-white p-5 rounded-xl shadow-lg border border-slate-700">
               <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">Active Profile</h3>
               {!selectedStudent ? (
                 <div className="text-center py-8">
                    <UserCheck className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                    <p className="text-xs text-slate-500">Select a student from the records tab to manage registration.</p>
                 </div>
               ) : (
                 <div className="space-y-4">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-bold">{selectedStudent.name[0]}</div>
                       <div>
                          <p className="font-bold text-sm leading-tight">{selectedStudent.name}</p>
                          <p className="text-[10px] font-mono text-slate-400">{selectedStudent.usn}</p>
                       </div>
                    </div>
                    <div className="pt-4 border-t border-slate-700 space-y-2">
                       <div className="flex justify-between text-[11px]">
                          <span className="text-slate-500">Academic Standing</span>
                          <span className="text-green-400 font-bold">Good</span>
                       </div>
                       <div className="flex justify-between text-[11px]">
                          <span className="text-slate-500">Current Semester</span>
                          <span className="text-slate-300 font-bold">{selectedStudent.semester}</span>
                       </div>
                    </div>
                 </div>
               )}
            </div>

            <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">Academic Requirements</h3>
                <div className="space-y-3">
                   {[
                     { label: 'Minimum Credits', val: 20 },
                     { label: 'Registered Credits', val: selectedStudent ? selectedStudent.registeredCourses.length * 4 : 0 },
                   ].map((item, i) => (
                     <div key={i}>
                        <div className="flex justify-between text-xs mb-1">
                           <span className="text-slate-600">{item.label}</span>
                           <span className="font-bold text-slate-800">{item.val}</span>
                        </div>
                        <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                           <div className="h-full bg-blue-500" style={{ width: `${Math.min(100, (item.val/20)*100)}%` }} />
                        </div>
                     </div>
                   ))}
                </div>
            </div>
          </div>

          {/* Registration Interface */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
               <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                  <h3 className="font-bold text-slate-700">Available Courses - Semester {selectedStudent?.semester || '?' }</h3>
                  <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-tighter">O(1) Access Logic</div>
               </div>
               <div className="divide-y divide-slate-100">
                  {COURSES.filter(c => c.semester === selectedStudent?.semester && c.branch === selectedStudent?.branch).map(course => {
                    const isRegistered = selectedStudent?.registeredCourses.includes(course.code);
                    return (
                      <div key={course.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                         <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${isRegistered ? 'bg-green-50 border-green-200 text-green-600' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                               {isRegistered ? <CheckCircle2 className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
                            </div>
                            <div>
                               <p className="text-sm font-bold text-slate-800">{course.name}</p>
                               <div className="flex gap-2 text-[10px] font-mono text-slate-400">
                                  <span>{course.code}</span>
                                  <span>•</span>
                                  <span>{course.credits} Credits</span>
                               </div>
                            </div>
                         </div>
                         <button 
                          disabled={!selectedStudent || isRegistered}
                          onClick={() => {
                             if (!selectedStudent) return;
                             setStudents(prev => prev.map(s => 
                               s.id === selectedStudentId 
                                 ? { ...s, registeredCourses: [...s.registeredCourses, course.code] }
                                 : s
                             ));
                          }}
                          className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                            isRegistered 
                              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                              : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                          }`}
                         >
                            {isRegistered ? 'Registered' : 'Register Now'}
                         </button>
                      </div>
                    )
                  })}
                  {(!selectedStudent) && (
                    <div className="p-12 text-center text-slate-400 italic text-sm">
                      Please select a student from the records tab to view eligible courses.
                    </div>
                  )}
               </div>
            </div>

            {selectedStudent && selectedStudent.registeredCourses.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <GraduationCap className="w-5 h-5 text-blue-600" />
                    <p className="text-sm text-blue-800 font-medium">Successfully registered for {selectedStudent.registeredCourses.length} courses.</p>
                 </div>
                 <button className="text-blue-600 text-xs font-bold hover:underline">Download Receipt</button>
              </div>
            )}
          </div>
        </div>
      )}

      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-200 w-full max-w-lg rounded-xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="text-xl font-bold text-slate-800 tracking-tight">University Enrollment</h3>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors text-2xl">&times;</button>
              </div>
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.target as HTMLFormElement;
                  const formData = new FormData(form);
                  const newStudent: Student = {
                    id: Math.random().toString(36).substring(2, 9),
                    usn: formData.get('usn') as string,
                    name: formData.get('name') as string,
                    branch: formData.get('branch') as string,
                    semester: Number(formData.get('semester')),
                    cgpa: Number(formData.get('cgpa')),
                    registeredCourses: []
                  };
                  setStudents([...students, newStudent]);
                  setShowAddModal(false);
                }}
                className="p-8 space-y-5"
              >
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest px-1">University USN</label>
                    <input name="usn" required pattern="^[1-4][A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{3}$" placeholder="1RV21CS001" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-mono" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest px-1">Full Legal Name</label>
                    <input name="name" required placeholder="John Doe" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-semibold" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest px-1">Academic Department</label>
                    <select name="branch" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all">
                      {BRANCHES.map(b => (
                        <option key={b.code} value={b.code}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest px-1">Curriculum Cycle</label>
                    <select name="semester" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all">
                      {SEMESTERS.map(s => (
                        <option key={s} value={s}>Semester {s}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest px-1">Cumulative Grade (CGPA)</label>
                  <input name="cgpa" type="number" step="0.01" min="0" max="10" required placeholder="0.00" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-mono" />
                </div>
                <div className="pt-6 flex gap-4">
                  <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-3 border border-slate-200 text-slate-500 rounded-lg hover:bg-slate-50 transition-all font-bold text-xs uppercase tracking-widest">Cancel</button>
                  <button type="submit" className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-md font-bold text-xs uppercase tracking-widest">Submit Record</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
