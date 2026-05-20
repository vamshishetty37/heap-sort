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
  const [selectedSortField, setSelectedSortField] = useState<SortField>('usn');
  const [selectedSortOrder, setSelectedSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isSorting, setIsSorting] = useState(false);
  const [lastSortTime, setLastSortTime] = useState<number | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'records' | 'registration'>('records');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<{ usn?: string; cgpa?: string; name?: string }>({});

  const handleOpenAddModal = () => {
    setFormErrors({});
    setShowAddModal(true);
  };

  const handleCloseAddModal = () => {
    setFormErrors({});
    setShowAddModal(false);
  };

  const selectedStudent = useMemo(() => 
    students.find(s => s.id === selectedStudentId), 
    [students, selectedStudentId]
  );

  // Filter and then sort using Heap Sort
  const processedStudents = useMemo(() => {
    let filtered = students.filter(s => {
      const branchName = BRANCHES.find(b => b.code.toUpperCase() === s.branch.toUpperCase())?.name || '';
      return s.name.toLowerCase().includes(search.toLowerCase()) ||
             s.usn.toLowerCase().includes(search.toLowerCase()) ||
             s.branch.toLowerCase().includes(search.toLowerCase()) ||
             branchName.toLowerCase().includes(search.toLowerCase());
    });

    // ==========================================
    // HEAP SORT PROCESS (O(N log N) COMPLEXITY)
    // ==========================================
    // 1. BUILD MAX HEAP:
    //    Initially converts the raw array into a max heap key-value storage representation
    //    where the parent node value is larger than or equal to its child node values.
    // 2. HEAPIFY:
    //    The core heapify() operation maintains the heap invariant. If a child node is larger
    //    than its parent, they are rearranged to float the higher values upwards.
    // 3. SWAP OPERATION:
    //    Repeatedly exchanges the maximum root node with the last active leaf node, and reduces
    //    the heap boundaries so that values settle into the sorted positions.
    // 4. FINAL SORTED OUTPUT:
    //    Once all items are extracted, the array contains the complete sorted sequences.
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
    let nextOrder: 'asc' | 'desc' = 'asc';
    if (sortField === field) {
      nextOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    }
    
    setSortField(field);
    setSortOrder(nextOrder);
    setSelectedSortField(field);
    setSelectedSortOrder(nextOrder);
    setLastSortTime(Date.now());
  };

  const handleApplyHeapSort = () => {
    setIsSorting(true);
    setTimeout(() => {
      // Toggle logic centered on CGPA Score:
      // First click: descending order (highest CGPA first)
      // Second click: ascending order (lowest CGPA first)
      let nextOrder: 'asc' | 'desc' = 'desc';
      if (sortField === 'cgpa') {
        nextOrder = sortOrder === 'desc' ? 'asc' : 'desc';
      }
      
      setSortField('cgpa');
      setSortOrder(nextOrder);
      setSelectedSortField('cgpa');
      setSelectedSortOrder(nextOrder);
      setLastSortTime(Date.now());
      setIsSorting(false);
    }, 300);
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
            onClick={handleOpenAddModal}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg flex items-center gap-2 transition-all shadow-sm font-semibold text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New Registry</span>
          </button>
        </div>
      </div>

      {activeTab === 'records' ? (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text"
                placeholder="Query by USN, Name or Department..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
              />
            </div>
            
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end font-sans">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Field:</span>
                <select 
                  value={selectedSortField}
                  onChange={(e) => setSelectedSortField(e.target.value as SortField)}
                  className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 cursor-pointer"
                >
                  <option value="usn">USN (Identity)</option>
                  <option value="name">Legal Name</option>
                  <option value="semester">Cycle (Semester)</option>
                  <option value="cgpa">CGPA Score</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Order:</span>
                <select 
                  value={selectedSortOrder}
                  onChange={(e) => setSelectedSortOrder(e.target.value as 'asc' | 'desc')}
                  className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 cursor-pointer"
                >
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
              </div>

              <button 
                onClick={handleApplyHeapSort}
                disabled={isSorting}
                className="bg-slate-800 hover:bg-slate-900 text-white text-xs px-4 py-2 rounded-md transition-all font-bold uppercase tracking-wider flex items-center gap-1.5 disabled:opacity-50 select-none cursor-pointer"
              >
                {isSorting ? (
                  <>
                    <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sorting...
                  </>
                ) : (
                  'Apply Heap Sort'
                )}
              </button>
            </div>
          </div>

          {lastSortTime && (
            <div className="px-5 py-2 border-b border-slate-100 bg-blue-50/40 flex items-center justify-between text-xs text-blue-700 font-bold font-mono animate-fade-in">
              <span className="flex items-center gap-1.5 font-sans">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                Heap Sort Applied Successfully
              </span>
              <span>Sorted by: {sortField.toUpperCase()} ({sortOrder.toUpperCase()})</span>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-[11px] font-bold uppercase text-slate-500 tracking-wider border-b border-slate-200 select-none">
                  <th 
                    className={`px-6 py-4 cursor-pointer hover:text-blue-600 transition-all ${sortField === 'usn' ? 'text-blue-700 bg-blue-50/40 font-extrabold' : 'text-slate-500'}`}
                    onClick={() => toggleSort('usn')}
                  >
                    <div className="flex items-center gap-2 uppercase">
                      USN (Identity) 
                      <ArrowUpDown className={`w-3 h-3 transition-colors ${sortField === 'usn' ? 'text-blue-600' : 'text-slate-300'}`} />
                    </div>
                  </th>
                  <th 
                    className={`px-6 py-4 cursor-pointer hover:text-blue-600 transition-all ${sortField === 'name' ? 'text-blue-700 bg-blue-50/40 font-extrabold' : 'text-slate-500'}`}
                    onClick={() => toggleSort('name')}
                  >
                     <div className="flex items-center gap-2 uppercase">
                       Legal Name 
                       <ArrowUpDown className={`w-3 h-3 transition-colors ${sortField === 'name' ? 'text-blue-600' : 'text-slate-300'}`} />
                     </div>
                  </th>
                  <th className="px-6 py-4 uppercase text-slate-500">Department</th>
                  <th 
                    className={`px-6 py-4 cursor-pointer hover:text-blue-600 transition-all ${sortField === 'semester' ? 'text-blue-700 bg-blue-50/40 font-extrabold' : 'text-slate-500'}`}
                    onClick={() => toggleSort('semester')}
                  >
                    <div className="flex items-center gap-2 uppercase">
                      Cycle 
                      <ArrowUpDown className={`w-3 h-3 transition-colors ${sortField === 'semester' ? 'text-blue-600' : 'text-slate-300'}`} />
                    </div>
                  </th>
                  <th 
                    className={`px-6 py-4 cursor-pointer hover:text-blue-600 transition-all ${sortField === 'cgpa' ? 'text-blue-700 bg-blue-50/40 font-extrabold' : 'text-slate-500'}`}
                    onClick={() => toggleSort('cgpa')}
                  >
                    <div className="flex items-center gap-2 uppercase">
                      CGPA Score 
                      <ArrowUpDown className={`w-3 h-3 transition-colors ${sortField === 'cgpa' ? 'text-blue-600' : 'text-slate-300'}`} />
                    </div>
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
                <h3 className="text-xl font-bold text-slate-800 tracking-tight">Impact College Enrollment</h3>
                <button onClick={handleCloseAddModal} className="text-slate-400 hover:text-slate-600 transition-colors text-2xl">&times;</button>
              </div>
              <form 
                noValidate
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.target as HTMLFormElement;
                  const formData = new FormData(form);
                  
                  // Extract and clean values to automatically support lowercase & spaces gracefully
                  const rawUsn = (formData.get('usn') as string || '').replace(/\s+/g, '').toUpperCase();
                  const rawName = (formData.get('name') as string || '').trim();
                  const cgpaStr = (formData.get('cgpa') as string || '').trim();
                  const cgpaValue = Number(cgpaStr);
                  
                  const errors: { usn?: string; cgpa?: string; name?: string } = {};
                  
                  // USN validation regex matches standard formats like 1BM20ME088, 4SU21CS001, 1IC24CY005
                  const usnRegex = /^[1-4][A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{3}$/;
                  if (!rawUsn || !usnRegex.test(rawUsn)) {
                    errors.usn = "Invalid USN format";
                  }
                  
                  // Allow names with spaces: ensure name isn't completely empty
                  if (!rawName) {
                    errors.name = "Full Legal Name is required";
                  }
                  
                  // CGPA must be a valid float/decimal between 0.0 and 10.0
                  if (cgpaStr === '' || isNaN(cgpaValue) || cgpaValue < 0 || cgpaValue > 10) {
                    errors.cgpa = "CGPA must be between 0 and 10";
                  }
                  
                  if (Object.keys(errors).length > 0) {
                    setFormErrors(errors);
                    return;
                  }
                  
                  setFormErrors({});
                  const newStudent: Student = {
                    id: Math.random().toString(36).substring(2, 9),
                    usn: rawUsn,
                    name: rawName,
                    branch: formData.get('branch') as string,
                    semester: Number(formData.get('semester')),
                    cgpa: cgpaValue,
                    registeredCourses: []
                  };
                  setStudents([...students, newStudent]);
                  setShowAddModal(false);
                }}
                className="p-8 space-y-5"
              >
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-1.5 flex flex-col justify-start">
                    <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest px-1 mr-auto flex">Impact College USN</label>
                    <input 
                      name="usn" 
                      placeholder="1RV21CS001" 
                      className={`w-full bg-slate-50 border rounded-lg px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-mono ${formErrors.usn ? 'border-red-400 focus:border-red-500' : 'border-slate-200'}`} 
                    />
                    {formErrors.usn && <span className="text-red-500 text-[11px] font-semibold mt-1 px-1">{formErrors.usn}</span>}
                  </div>
                  <div className="space-y-1.5 flex flex-col justify-start">
                    <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest px-1 mr-auto flex">Full Legal Name</label>
                    <input 
                      name="name" 
                      placeholder="John Doe" 
                      className={`w-full bg-slate-50 border rounded-lg px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-semibold ${formErrors.name ? 'border-red-400 focus:border-red-500' : 'border-slate-200'}`} 
                    />
                    {formErrors.name && <span className="text-red-500 text-[11px] font-semibold mt-1 px-1">{formErrors.name}</span>}
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
                  <input 
                    name="cgpa" 
                    type="number" 
                    step="0.01" 
                    placeholder="0.00" 
                    className={`w-full bg-slate-50 border rounded-lg px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-mono ${formErrors.cgpa ? 'border-red-400 focus:border-red-500' : 'border-slate-200'}`} 
                  />
                  {formErrors.cgpa && <span className="text-red-500 text-[11px] font-semibold mt-1 px-1">{formErrors.cgpa}</span>}
                </div>
                <div className="pt-6 flex gap-4">
                  <button type="button" onClick={handleCloseAddModal} className="flex-1 px-4 py-3 border border-slate-200 text-slate-500 rounded-lg hover:bg-slate-50 transition-all font-bold text-xs uppercase tracking-widest">Cancel</button>
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
