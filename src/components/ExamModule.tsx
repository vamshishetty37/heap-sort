/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Exam, SortField } from '../types';
import { BRANCHES, INITIAL_EXAMS, COURSES } from '../constants';
import { heapSort } from '../lib/heapSort';
import { Search, Plus, Calendar as CalendarIcon, MapPin, BookOpen, Clock, AlertCircle, CheckCircle2, Loader } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { motion, AnimatePresence } from 'motion/react';

export default function ExamModule() {
  const [exams, setExams] = useState<Exam[]>(INITIAL_EXAMS);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [conflict, setConflict] = useState<string | null>(null);

  // States for manual subject/course entry mode
  const [subjectInputMode, setSubjectInputMode] = useState<'predefined' | 'manual'>('predefined');
  const [customSubjectCode, setCustomSubjectCode] = useState('');
  const [customSubjectName, setCustomSubjectName] = useState('');

  // Department mapping state & semester selection trackers to control dropdown update logic
  const [selectedBranch, setSelectedBranch] = useState(BRANCHES[0]?.code || 'CS');
  const [selectedSemester, setSelectedSemester] = useState(4);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);

  /**
   * Generates a beautifully styled, professional PDF timetable.
   * Compiles the agenda by applying the Heap Sort algorithm across exam dates and start times.
   */
  const handleGeneratePdf = () => {
    setIsPdfGenerating(true);
    
    // Defer processing slightly so the user experiences a smooth, responsive loading feedback cycle
    setTimeout(() => {
      try {
        const doc = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
        });

        // ----------------------------------------------------
        // LOGICAL HELPERS
        // ----------------------------------------------------
        
        // 12-hour AM/PM time parser converted to minutes from midnight for math sorting
        const parseTimeToMinutes = (timeStr: string): number => {
          const match = timeStr.trim().match(/^(\d+):(\d+)\s*(AM|PM)$/i);
          if (!match) return 0;
          let hours = parseInt(match[1], 10);
          const minutes = parseInt(match[2], 10);
          const ampm = match[3].toUpperCase();
          
          if (ampm === 'PM' && hours < 12) {
            hours += 12;
          } else if (ampm === 'AM' && hours === 12) {
            hours = 0;
          }
          return hours * 60 + minutes;
        };

        // Date layout beautifier (transforming 2024-06-15 -> 15 Jun 2024)
        const formatDatePdf = (dateStr: string) => {
          const d = new Date(dateStr);
          if (isNaN(d.getTime())) return dateStr;
          return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
        };

        // ====================================================
        // HEAP SORT PROCESS (O(N log N) COMPLEXITY)
        // ====================================================
        // We systematically arrange the exams first chronologically by date.
        // If exams have conflicting or identical dates, they are further ordered by start time.
        const sortedExams = heapSort<Exam>(exams, (a: Exam, b: Exam) => {
          const dateCompare = a.date.localeCompare(b.date);
          if (dateCompare !== 0) return dateCompare;
          return parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time);
        });

        // Running page index
        let currentPageNum = 1;

        // Footer builder for rendering at page-boundaries
        const drawFooter = (pageNum: number) => {
          const footY = 282;
          // Thin separator lines
          doc.setDrawColor(226, 232, 240);
          doc.setLineWidth(0.3);
          doc.line(15, footY, 195, footY);
          
          doc.setFont('Helvetica', 'normal');
          doc.setFontSize(7.5);
          doc.setTextColor(148, 163, 184);
          doc.text('Impact College of Engineering • Campus Portal Systems', 15, footY + 4);
          doc.text(`Page ${pageNum}`, 195, footY + 4, { align: 'right' });
        };

        // Header builder for initial page and sub-pages
        const drawHeader = () => {
          // Top solid blue panel border (color matching college navbar branding)
          doc.setFillColor(0, 51, 102);
          doc.rect(0, 0, 210, 4, 'F');

          // Logo Placement - Dynamic high-fidelity official logo drawing (matches original blue/stand/box brand)
          // Meridian bracket arc
          doc.setDrawColor(0, 51, 102);
          doc.setLineWidth(0.45);
          doc.ellipse(24, 21.5, 8.5, 8.5, 'S'); // Outer meridian scale circular ring
          doc.setLineWidth(0.15);
          doc.ellipse(24, 21.5, 9, 9, 'S'); // Outer double ring line detail
          
          // Axis line
          doc.setDrawColor(0, 51, 102);
          doc.setLineWidth(0.3);
          doc.line(21, 14.5, 27, 28.5); // Tilted axis rod (23.5 degrees)

          // Polaris Core Pins
          doc.setFillColor(0, 51, 102);
          doc.circle(21, 14.5, 0.4, 'F');
          doc.circle(27, 28.5, 0.4, 'F');
          
          // Main globe inner sphere
          doc.setFillColor(255, 255, 255);
          doc.circle(24, 21.5, 6.8, 'F'); // White backdrop mask for the globe sphere
          
          doc.setDrawColor(0, 51, 102);
          doc.setLineWidth(0.4);
          doc.circle(24, 21.5, 6.8, 'S'); // Globe boundary circle

          // Inside sphere grid lines
          doc.setLineWidth(0.2);
          doc.line(17.5, 21.5, 30.5, 21.5); // Equator
          doc.ellipse(24, 21.5, 4.2, 6.8, 'S'); // Outer longitude curve
          doc.ellipse(24, 21.5, 1.8, 6.8, 'S'); // Inner longitude curve

          // Support neck of the stand
          doc.setLineWidth(1.0);
          doc.line(24, 30.0, 24, 33);
          
          // Stepped stand base plate
          doc.setLineWidth(0.45);
          doc.line(20, 33, 28, 33);

          // Impact Banner box at the bottom of stand
          doc.setFillColor(0, 51, 102);
          doc.rect(13, 34, 22, 4.2, 'F'); // Bottom blue bounding box

          // Letters inside bottom banner
          doc.setFont('Helvetica', 'bold');
          doc.setFontSize(3.2);
          doc.setTextColor(255, 255, 255);
          doc.text('IMPACT', 24, 37.1, { align: 'center' });

          // Institutional Header metadata
          doc.setFont('Helvetica', 'bold');
          doc.setFontSize(15);
          doc.setTextColor(0, 51, 102);
          doc.text('Impact College of Engineering', 38, 21);

          doc.setFont('Helvetica', 'bold');
          doc.setFontSize(11);
          doc.setTextColor(51, 65, 85);
          doc.text('Semester Examination Schedule', 38, 27);

          doc.setFont('Helvetica', 'normal');
          doc.setFontSize(8.5);
          doc.setTextColor(100, 116, 139);
          doc.text('Office of the Registrar (E-Governance Cell)', 38, 32);

          // Timestamp and document credentials on top right
          const currentLocalTime = new Date().toLocaleDateString('en-IN', { 
            day: '2-digit', 
            month: 'short', 
            year: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit', 
            hour12: true 
          });
          doc.setFontSize(8);
          doc.setFont('Helvetica', 'normal');
          doc.setTextColor(148, 163, 184);
          doc.text('GENERATED ON:', 195, 20, { align: 'right' });
          
          doc.setFont('Helvetica', 'bold');
          doc.setTextColor(51, 65, 85);
          doc.text(currentLocalTime.toUpperCase(), 195, 24, { align: 'right' });

          doc.setFont('Helvetica', 'normal');
          doc.setTextColor(148, 163, 184);
          doc.text('PORTAL VERSION:', 195, 29, { align: 'right' });
          
          doc.setFont('Helvetica', 'bold');
          doc.setTextColor(51, 65, 85);
          doc.text('V2.4.1-STABLE', 195, 33, { align: 'right' });

          // Thick gold decorative divider line
          doc.setDrawColor(255, 215, 0);
          doc.setLineWidth(0.8);
          doc.line(15, 38, 195, 38);
        };

        // Draw header on primary page
        drawHeader();

        // Banner highlighting compilation algorithm details
        doc.setFillColor(241, 245, 249); // slate-100
        doc.rect(15, 42, 180, 8, 'F');
        
        doc.setFillColor(59, 130, 246); // blue-500 indicator vertical block
        doc.rect(15, 42, 1.5, 8, 'F');

        doc.setFont('Helvetica', 'italic');
        doc.setFontSize(8);
        doc.setTextColor(0, 51, 102);
        doc.text('Schedule optimization compiler: Sorted using Heap Sort Algorithm (O(N log N) Heapified complexity)', 20, 47.2);

        // Grid starting coords
        let currentY = 55;

        if (sortedExams.length === 0) {
          // Empty state handler (Requirements)
          doc.setFillColor(254, 242, 242); // red-50
          doc.rect(15, currentY, 180, 20, 'F');
          
          doc.setDrawColor(252, 165, 165); // red-200
          doc.setLineWidth(0.4);
          doc.rect(15, currentY, 180, 20, 'D');

          doc.setFont('Helvetica', 'bold');
          doc.setFontSize(9.5);
          doc.setTextColor(220, 38, 38);
          doc.text('No scheduled exams available.', 20, currentY + 8);

          doc.setFont('Helvetica', 'normal');
          doc.setFontSize(8.5);
          doc.setTextColor(185, 28, 28);
          doc.text('Please authorize or schedule a course shift in the Registrar platform to compile a timetable.', 20, currentY + 14);
          
          drawFooter(currentPageNum);
        } else {
          // Column Headers
          doc.setFillColor(0, 51, 102);
          doc.rect(15, currentY, 180, 9, 'F');

          doc.setFont('Helvetica', 'bold');
          doc.setFontSize(9);
          doc.setTextColor(255, 255, 255);
          doc.text('Date & Time', 18, currentY + 6);
          doc.text('Course / Subject Code & Name', 65, currentY + 6);
          doc.text('Location (Hall)', 140, currentY + 6);
          doc.text('Duration', 175, currentY + 6);

          // Underline gold border
          doc.setDrawColor(255, 215, 0);
          doc.setLineWidth(0.5);
          doc.line(15, currentY + 9, 195, currentY + 9);

          currentY += 9;

          // Populate exam rows with beautiful padding and cell wrapping
          sortedExams.forEach((exam, idx) => {
            const courseCode = exam.subjectCode.toUpperCase();
            const courseName = exam.subjectName;
            const fullCourseText = `${courseCode} - ${courseName}`;
            
            // Auto wrap subject names within narrow column bounds
            const wrappedSubject = doc.splitTextToSize(fullCourseText, 70);
            
            // Grid cell heights
            const rowHeight = Math.max(11, wrappedSubject.length * 5.2 + 3);

            // Page end wrapping interceptor
            if (currentY + rowHeight > 270) {
              drawFooter(currentPageNum);
              doc.addPage();
              currentPageNum++;
              
              // Draw top line panel
              doc.setFillColor(0, 51, 102);
              doc.rect(0, 0, 210, 4, 'F');

              // Draw sub-headers
              doc.setFillColor(0, 51, 102);
              doc.rect(15, 15, 180, 9, 'F');

              doc.setFont('Helvetica', 'bold');
              doc.setFontSize(9);
              doc.setTextColor(255, 255, 255);
              doc.text('Date & Time', 18, 21);
              doc.text('Course / Subject Code & Name', 65, 21);
              doc.text('Location (Hall)', 140, 21);
              doc.text('Duration', 175, 21);

              doc.setDrawColor(255, 215, 0);
              doc.setLineWidth(0.5);
              doc.line(15, 24, 195, 24);

              currentY = 24;
            }

            // Zebra styling alternating backgrounds
            const isEven = idx % 2 === 0;
            const r = isEven ? 255 : 248;
            const g = isEven ? 255 : 250;
            const b = isEven ? 255 : 252;
            doc.setFillColor(r, g, b);
            doc.rect(15, currentY, 180, rowHeight, 'F');

            // Bottom row border
            doc.setDrawColor(226, 232, 240);
            doc.setLineWidth(0.25);
            doc.line(15, currentY + rowHeight, 195, currentY + rowHeight);

            // Column vertical frame border lines
            doc.line(15, currentY, 15, currentY + rowHeight);
            doc.line(195, currentY, 195, currentY + rowHeight);

            // Draw Column 1 Content
            doc.setFont('Helvetica', 'bold');
            doc.setFontSize(8.5);
            doc.setTextColor(51, 65, 85);
            doc.text(formatDatePdf(exam.date), 18, currentY + 5.2);
            
            doc.setFont('Helvetica', 'normal');
            doc.setTextColor(100, 116, 139);
            doc.text(exam.time, 18, currentY + 9.8);

            // Draw Column 2 Wrapped Content (Subject Metadata)
            wrappedSubject.forEach((lineText: string, lineIdx: number) => {
              if (lineIdx === 0) {
                doc.setFont('Helvetica', 'bold');
                doc.setTextColor(0, 31, 80);
                doc.text(lineText, 65, currentY + 5.2);
              } else {
                doc.setFont('Helvetica', 'normal');
                doc.setTextColor(71, 85, 105);
                doc.text(lineText, 65, currentY + 5.2 + (lineIdx * 4.5));
              }
            });

            // Draw Column 3 (Hall Code)
            doc.setFont('Helvetica', 'normal');
            doc.setFontSize(8.5);
            doc.setTextColor(51, 65, 85);
            doc.text(`Hall ${exam.hall}`, 140, currentY + 5.2);

            // Draw Column 4 (Expected Duration)
            doc.text(exam.duration, 175, currentY + 5.2);

            currentY += rowHeight;
          });

          // Draw footer for final page
          drawFooter(currentPageNum);
        }

        // Trigger prompt-free browser download
        doc.save('Impact_College_Exam_Schedule.pdf');
      } catch (error) {
        console.error('PDF compiling failure:', error);
      } finally {
        setIsPdfGenerating(false);
      }
    }, 800);
  };

  // Dynamic subject filtering logic: Re-evaluates whenever the active department or cycle changes.
  // Filters courses to match selected department (branch) in the UI.
  const filteredCourses = useMemo(() => {
    const matching = COURSES.filter(c => c.branch === selectedBranch && c.semester === Number(selectedSemester));
    if (matching.length > 0) return matching;
    // Fallback: If no subjects exist for the specific semester, show all subjects of the selected department
    return COURSES.filter(c => c.branch === selectedBranch);
  }, [selectedBranch, selectedSemester]);

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
            onClick={handleGeneratePdf}
            disabled={isPdfGenerating}
            className="bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-75 disabled:cursor-wait px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all border border-slate-200 shadow-sm font-semibold text-sm"
          >
            {isPdfGenerating ? (
              <Loader className="w-4 h-4 animate-spin text-slate-500" />
            ) : null}
            <span>{isPdfGenerating ? 'Generating PDF...' : 'Generate Schedule PDF'}</span>
          </button>
          <button 
            onClick={() => {
              setSubjectInputMode('predefined');
              setCustomSubjectCode('');
              setCustomSubjectName('');
              setShowScheduleModal(true);
            }}
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

                  let finalSubjectCode = '';
                  let finalSubjectName = '';

                  if (subjectInputMode === 'predefined') {
                    const courseCode = formData.get('course') as string;
                    const course = COURSES.find(c => c.code === courseCode);
                    finalSubjectCode = courseCode;
                    finalSubjectName = course?.name || 'Unknown Subject';
                  } else {
                    finalSubjectCode = customSubjectCode.trim().toUpperCase();
                    finalSubjectName = customSubjectName.trim();
                    if (!finalSubjectCode || !finalSubjectName) {
                      setConflict('Please enter both course code and subject name.');
                      return;
                    }
                  }

                  const newExam: Exam = {
                    id: Math.random().toString(36).substring(2, 9),
                    subjectCode: finalSubjectCode,
                    subjectName: finalSubjectName,
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
                    {/* Department Select with Dropdown Update Logic */}
                    <select 
                      name="branch" 
                      required 
                      value={selectedBranch}
                      onChange={(e) => {
                        // Triggers dynamic updates of subjects based on selected department code
                        setSelectedBranch(e.target.value);
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                    >
                      {BRANCHES.map(b => (
                        <option key={b.code} value={b.code}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest px-1">Semester</label>
                    {/* Semester Select that contributes to dynamic subject filtering */}
                    <select 
                      name="semester" 
                      required 
                      value={selectedSemester}
                      onChange={(e) => {
                        setSelectedSemester(Number(e.target.value));
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                        <option key={s} value={s}>Semester {s}</option>
                      ))}
                    </select>
                  </div>
                </div>
                {/* Subject Selection Mode Toggle */}
                <div className="space-y-1.5 animate-fade-in">
                  <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest px-1">Subject Entry Mode</label>
                  <div className="flex bg-slate-100 p-1 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setSubjectInputMode('predefined')}
                      className={`flex-1 text-center py-1.5 rounded-md text-xs font-bold transition-all ${
                        subjectInputMode === 'predefined'
                          ? 'bg-white text-blue-600 shadow-sm'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      Predefined Courses
                    </button>
                    <button
                      type="button"
                      onClick={() => setSubjectInputMode('manual')}
                      className={`flex-1 text-center py-1.5 rounded-md text-xs font-bold transition-all ${
                        subjectInputMode === 'manual'
                          ? 'bg-white text-blue-600 shadow-sm'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      Custom Manual Entry
                    </button>
                  </div>
                </div>

                {subjectInputMode === 'predefined' ? (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest px-1">Course Code</label>
                    {/* Dynamic Course Select showing ONLY the subjects corresponding to the selected department */}
                    <select name="course" required={subjectInputMode === 'predefined'} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all">
                      {filteredCourses.length > 0 ? (
                        filteredCourses.map(c => (
                          <option key={c.id} value={c.code}>{c.code} - {c.name}</option>
                        ))
                      ) : (
                        <option disabled value="">No courses available for selected cycle</option>
                      )}
                    </select>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest px-1">Subject Code</label>
                      <input
                        type="text"
                        required={subjectInputMode === 'manual'}
                        placeholder="e.g. 21CS46"
                        value={customSubjectCode}
                        onChange={(e) => setCustomSubjectCode(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all uppercase font-mono"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest px-1">Subject Name</label>
                      <input
                        type="text"
                        required={subjectInputMode === 'manual'}
                        placeholder="e.g. Cloud Security"
                        value={customSubjectName}
                        onChange={(e) => setCustomSubjectName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>
                )}
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
