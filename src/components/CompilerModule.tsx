import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  RotateCcw, 
  Sliders, 
  Code2, 
  ListStart, 
  Cpu, 
  BookOpen, 
  ChevronRight, 
  Check, 
  Wrench 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HeapStep {
  array: number[];
  heapSize: number;
  type: 'init' | 'compare' | 'swap' | 'post-swap' | 'extract' | 'done';
  phase: 'Build Max-Heap' | 'Extract & Sort';
  description: string;
  focusIdx?: number;
  compareIdxs?: number[];
  swapIdxs?: number[];
  largestIdx?: number;
  codeHighlightLines?: number[]; // lines of heapify code to highlight
}

export default function CompilerModule() {
  const [inputValue, setInputValue] = useState('45, 12, 85, 32, 70, 19, 60');
  const [elements, setElements] = useState<number[]>([45, 12, 85, 32, 70, 19, 60]);
  const [steps, setSteps] = useState<HeapStep[]>([]);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1200); // ms
  const [selectedPreset, setSelectedPreset] = useState('Default Mixed');

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const presets = {
    'Default Mixed': '45, 12, 85, 32, 70, 19, 60',
    'Reverse Sorted': '90, 80, 70, 60, 50, 40, 30',
    'Nearly Sorted': '10, 20, 15, 30, 25, 35, 40',
    'Duplicates': '15, 45, 15, 30, 45, 10, 30',
    'Random Small': '8, 19, 3, 14, 27, 33',
  };

  // Generate steps of Heap Sort Algorithm
  const compileAndGenerateSteps = (arrToCompile: number[]) => {
    const recordedSteps: HeapStep[] = [];
    const arr = [...arrToCompile];
    const n = arr.length;

    // Helper to log line highlights:
    // 1: function heapify(arr, size, i)
    // 2:   let largest = i;
    // 3:   let l = 2 * i + 1, r = 2 * i + 2;
    // 4:   if (l < size && arr[l] > arr[largest]) largest = l;
    // 5:   if (r < size && arr[r] > arr[largest]) largest = r;
    // 6:   if (largest !== i) {
    // 7:     swap(arr, i, largest);
    // 8:     heapify(arr, size, largest);
    // 9:   }

    // Initial state
    recordedSteps.push({
      array: [...arr],
      heapSize: n,
      type: 'init',
      phase: 'Build Max-Heap',
      description: `Compiler initialized. Received array: [${arr.join(', ')}]. Beginning O(N log N) Max-Heap phase.`,
      codeHighlightLines: [1, 2],
    });

    const heapify = (size: number, i: number) => {
      let largest = i;
      const l = 2 * i + 1;
      const r = 2 * i + 2;

      const compIdxs: number[] = [];
      if (l < size) compIdxs.push(l);
      if (r < size) compIdxs.push(r);

      // Compare Step representation
      recordedSteps.push({
        array: [...arr],
        heapSize: size,
        type: 'compare',
        phase: 'Build Max-Heap',
        description: `Comparing parent node index ${i} (value: ${arr[i]}) with children: left ${l < size ? `index ${l} (${arr[l]})` : 'none'} and right ${r < size ? `index ${r} (${arr[r]})` : 'none'}.`,
        focusIdx: i,
        compareIdxs: compIdxs,
        largestIdx: largest,
        codeHighlightLines: [3, 4, 5],
      });

      if (l < size && arr[l] > arr[largest]) {
        largest = l;
      }
      if (r < size && arr[r] > arr[largest]) {
        largest = r;
      }

      if (largest !== i) {
        // Swap intention recorded
        recordedSteps.push({
          array: [...arr],
          heapSize: size,
          type: 'swap',
          phase: 'Build Max-Heap',
          description: `Out-of-order state! Values violated. Node at index ${largest} (value: ${arr[largest]}) is larger than parent ${arr[i]} at index ${i}. Swapping parent with child.`,
          focusIdx: i,
          compareIdxs: compIdxs,
          swapIdxs: [i, largest],
          largestIdx: largest,
          codeHighlightLines: [6, 7],
        });

        // Perform swap
        const temp = arr[i];
        arr[i] = arr[largest];
        arr[largest] = temp;

        recordedSteps.push({
          array: [...arr],
          heapSize: size,
          type: 'post-swap',
          phase: 'Build Max-Heap',
          description: `Swapped index ${i} with index ${largest}. Value ${arr[i]} reaches parent position. Recursively heapifying affected sub-tree index ${largest}.`,
          focusIdx: largest,
          swapIdxs: [i, largest],
          largestIdx: largest,
          codeHighlightLines: [8],
        });

        heapify(size, largest);
      } else {
        recordedSteps.push({
          array: [...arr],
          heapSize: size,
          type: 'compare',
          phase: 'Build Max-Heap',
          description: `Completed heapify checks. Current localized subtree of index ${i} satisfies valid Max-Heap condition (Parent ${arr[i]} holds largest value).`,
          focusIdx: i,
          largestIdx: largest,
          codeHighlightLines: [6],
        });
      }
    };

    // 1. Build Max Heap
    const lastParentIndex = Math.floor(n / 2) - 1;
    recordedSteps.push({
      array: [...arr],
      heapSize: n,
      type: 'init',
      phase: 'Build Max-Heap',
      description: `Starting Phase 1 (Build Max-Heap). Scanning parents bottom-up starting from the last non-leaf parent index: ${lastParentIndex}.`,
      codeHighlightLines: [1],
    });

    for (let i = lastParentIndex; i >= 0; i--) {
      heapify(n, i);
    }

    // Force phase titles for Build Max Heap portion
    recordedSteps.forEach(s => {
      s.phase = 'Build Max-Heap';
    });

    // 2. Extract and Sort Phase
    for (let sizeNow = n - 1; sizeNow > 0; sizeNow--) {
      // Extraction swap recorded
      recordedSteps.push({
        array: [...arr],
        heapSize: sizeNow + 1,
        type: 'extract',
        phase: 'Extract & Sort',
        description: `Max-value extraction. Root at index 0 (${arr[0]}) holds maximum priority in remaining heap. Expropriating it with last index ${sizeNow} (${arr[sizeNow]}).`,
        swapIdxs: [0, sizeNow],
        codeHighlightLines: [7], // swaps elements
      });

      // Swap
      const temp = arr[0];
      arr[0] = arr[sizeNow];
      arr[sizeNow] = temp;

      recordedSteps.push({
        array: [...arr],
        heapSize: sizeNow,
        type: 'compare',
        phase: 'Extract & Sort',
        description: `Element ${temp} is safely locked at sorted index ${sizeNow}. Heap size reduced to ${sizeNow}. Reinforcing heap integrity from root node index 0.`,
        codeHighlightLines: [8],
      });

      // Heapify root element downwards inside remaining sort size
      const sortHeapify = (sz: number, currIdx: number) => {
        let largest = currIdx;
        const l = 2 * currIdx + 1;
        const r = 2 * currIdx + 2;

        const compIdxs: number[] = [];
        if (l < sz) compIdxs.push(l);
        if (r < sz) compIdxs.push(r);

        recordedSteps.push({
          array: [...arr],
          heapSize: sz,
          type: 'compare',
          phase: 'Extract & Sort',
          description: `Heapifying remaining sorted tree. Checking parent value ${arr[currIdx]} at index ${currIdx} against left ${l < sz ? `${arr[l]} (index ${l})` : 'none'} & right ${r < sz ? `${arr[r]} (index ${r})` : 'none'}.`,
          focusIdx: currIdx,
          compareIdxs: compIdxs,
          largestIdx: largest,
          codeHighlightLines: [3, 4, 5],
        });

        if (l < sz && arr[l] > arr[largest]) {
          largest = l;
        }
        if (r < sz && arr[r] > arr[largest]) {
          largest = r;
        }

        if (largest !== currIdx) {
          recordedSteps.push({
            array: [...arr],
            heapSize: sz,
            type: 'swap',
            phase: 'Extract & Sort',
            description: `Violation identified: Child node index ${largest} (value: ${arr[largest]}) exceeds parent root value ${arr[currIdx]}. Swapping key positions.`,
            focusIdx: currIdx,
            compareIdxs: compIdxs,
            swapIdxs: [currIdx, largest],
            largestIdx: largest,
            codeHighlightLines: [6, 7],
          });

          const swapTemp = arr[currIdx];
          arr[currIdx] = arr[largest];
          arr[largest] = swapTemp;

          recordedSteps.push({
            array: [...arr],
            heapSize: sz,
            type: 'post-swap',
            phase: 'Extract & Sort',
            description: `Swapped complete. Value ${arr[currIdx]} is parent. Running downstream heap checks recursively on child index ${largest}.`,
            focusIdx: largest,
            swapIdxs: [currIdx, largest],
            largestIdx: largest,
            codeHighlightLines: [8],
          });

          sortHeapify(sz, largest);
        } else {
          recordedSteps.push({
            array: [...arr],
            heapSize: sz,
            type: 'compare',
            phase: 'Extract & Sort',
            description: `Subtree index ${currIdx} satisfies standard Max-Heap properties. No downfalls necessary.`,
            focusIdx: currIdx,
            largestIdx: largest,
            codeHighlightLines: [6],
          });
        }
      };

      sortHeapify(sizeNow, 0);
    }

    recordedSteps.push({
      array: [...arr],
      heapSize: 0,
      type: 'done',
      phase: 'Extract & Sort',
      description: `Sort Complete! Max-Heap sorting completed. The entire parsed array has been isolated, heapified, and arranged in ascendency: [${arr.join(', ')}].`,
      codeHighlightLines: [],
    });

    setSteps(recordedSteps);
    setCurrentStepIdx(0);
  };

  // Run calculation when elements change
  useEffect(() => {
    compileAndGenerateSteps(elements);
  }, [elements]);

  // Autoplay handler
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentStepIdx((prev) => {
          if (prev >= steps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, playbackSpeed);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, steps, playbackSpeed]);

  const handleCompilerLoad = () => {
    const rawInput = inputValue
      .split(',')
      .map(num => Number(num.trim()))
      .filter(num => !isNaN(num) && num > 0);

    if (rawInput.length < 3) {
      alert('Please enter at least 3 comma-separated numbers (maximum 15 recommended for visual clarity).');
      return;
    }

    if (rawInput.length > 20) {
      alert('Truncating to maximum 15 elements to ensure perfect, responsive visualization quality.');
      setElements(rawInput.slice(0, 15));
      setInputValue(rawInput.slice(0, 15).join(', '));
      return;
    }

    setElements(rawInput);
    setIsPlaying(false);
  };

  const handlePresetSelect = (presetName: keyof typeof presets) => {
    setSelectedPreset(presetName);
    const presetVal = presets[presetName];
    setInputValue(presetVal);
    const parsed = presetVal.split(',').map(num => Number(num.trim()));
    setElements(parsed);
    setIsPlaying(false);
  };

  const codeSnippets = [
    { line: 1, text: "void heapSort(int arr[], int n) {" },
    { line: 2, text: "  // Phase 1: Build heap (rearrange array)" },
    { line: 3, text: "  for (int i = n / 2 - 1; i >= 0; i--)" },
    { line: 4, text: "    heapify(arr, n, i);" },
    { line: 5, text: "  // Phase 2: One by one extract elements" },
    { line: 6, text: "  for (int i = n - 1; i > 0; i--) {" },
    { line: 7, text: "    swap(arr[0], arr[i]);" },
    { line: 8, text: "    heapify(arr, i, 0);" },
    { line: 9, text: "  }\n}" },
    { line: 10, text: "" },
    { line: 11, text: "void heapify(int arr[], int size, int i) {" },
    { line: 12, text: "  int largest = i; // Root" },
    { line: 13, text: "  int l = 2*i + 1, r = 2*i + 2;" },
    { line: 14, text: "  if (l < size && arr[l] > arr[largest])" },
    { line: 15, text: "    largest = l;" },
    { line: 16, text: "  if (r < size && arr[r] > arr[largest])" },
    { line: 17, text: "    largest = r;" },
    { line: 18, text: "  if (largest != i) {" },
    { line: 19, text: "    swap(arr[i], arr[largest]);" },
    { line: 20, text: "    heapify(arr, size, largest);" },
    { line: 21, text: "  }\n}" }
  ];

  // Map compiler highlighted pseudo-lines over actual code lines for display highlight
  const getLineHighlightStatus = (lineNum: number, currentStep: HeapStep) => {
    if (!currentStep || !currentStep.codeHighlightLines) return false;
    const miniLines = currentStep.codeHighlightLines;

    // Mapping mini-snippet concepts (1 to 8) to physical lines of full snippet for visual representation
    if (currentStep.phase === 'Build Max-Heap') {
      if (miniLines.includes(1) && lineNum === 3) return true;
      if (miniLines.includes(2) && lineNum === 12) return true;
      if (miniLines.includes(3) && lineNum === 13) return true;
      if (miniLines.includes(4) && lineNum === 14) return true;
      if (miniLines.includes(5) && lineNum === 16) return true;
      if (miniLines.includes(6) && lineNum === 18) return true;
      if (miniLines.includes(7) && lineNum === 19) return true;
      if (miniLines.includes(8) && lineNum === 20) return true;
    } else {
      // Extraction Phase mapping
      if (miniLines.includes(7) && lineNum === 7) return true;
      if (miniLines.includes(8) && lineNum === 8) return true;
      if (miniLines.includes(3) && lineNum === 13) return true;
      if (miniLines.includes(4) && lineNum === 14) return true;
      if (miniLines.includes(5) && lineNum === 16) return true;
      if (miniLines.includes(6) && lineNum === 18) return true;
      if (miniLines.includes(7) && lineNum === 19) return true;
      if (miniLines.includes(8) && lineNum === 20) return true;
    }
    return false;
  };

  const currentStep = steps[currentStepIdx] || {
    array: elements,
    heapSize: elements.length,
    type: 'init',
    phase: 'Build Max-Heap',
    description: 'Preparing array configuration files...',
  };

  // Helper arrays for highlighting in arrays list
  const activeArr = currentStep.array;
  const focusIdx = currentStep.focusIdx;
  const compareIdxs = currentStep.compareIdxs || [];
  const swapIdxs = currentStep.swapIdxs || [];
  const heapSize = currentStep.heapSize;

  // Compute node coordinate mapping inside SVG viewport (width: 500, height: 210)
  const getNodeCoordinates = (index: number, total: number) => {
    const depth = Math.floor(Math.log2(index + 1));
    const levelStartIdx = Math.pow(2, depth) - 1;
    const posInLevel = index - levelStartIdx;
    const nodesInLevel = Math.pow(2, depth);

    // Levels distributions
    const y = 35 + depth * 45;
    const x = (posInLevel + 0.5) * (500 / nodesInLevel);

    return { x, y, depth };
  };

  return (
    <div className="space-y-8 animate-fade-in" id="compiler-module-container">
      {/* Header banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-blue-600" />
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider font-mono">Core Executable Compiler Sandbox</span>
          </div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight mt-1">Max-Heap Algorithm visualizer</h2>
          <p className="text-slate-500 mt-1">Compile your customize data sets and trace sub-tree heapifications step by step manually.</p>
        </div>

        {/* Preset Selector */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Presets:</span>
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
            {Object.keys(presets).map((pName) => (
              <button
                key={pName}
                onClick={() => handlePresetSelect(pName as keyof typeof presets)}
                className={`px-3 py-1 rounded text-xs transition-colors font-semibold ${
                  selectedPreset === pName 
                    ? 'bg-[#003366] text-white shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {pName}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left column: Custom array compiler inputs & tracking log */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Section: Custom elements input compiler console */}
          <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
              <Wrench className="w-4 h-4 text-[#003366]" />
              Element Input Controller
            </h3>
            
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Comma-Separated Values</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="e.g. 15, 30, 8, 22"
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm font-mono text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500"
                />
                <button
                  onClick={handleCompilerLoad}
                  className="bg-[#003366] hover:bg-slate-700 text-white font-bold text-xs px-4 py-2 rounded-lg transition-all shadow border-b-2 border-slate-900"
                >
                  Compile
                </button>
              </div>
              <span className="text-[10px] text-slate-400 leading-normal block italic mt-1 font-sans">
                Supports numeric nodes up to 15 entries for optimized visual balance.
              </span>
            </div>

            {/* Stepper Speed controls */}
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Playback Delay Speed</span>
                <span className="text-xs font-mono font-bold text-blue-600">{(playbackSpeed / 1000).toFixed(1)}s</span>
              </div>
              <input 
                type="range" 
                min="400" 
                max="3000" 
                step="200"
                value={playbackSpeed}
                onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                className="w-full accent-blue-600 h-1.5 bg-slate-100 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Section: Interactive trace log of currently selected step */}
          <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm flex flex-col h-[280px]">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 border-b border-slate-100 pb-3 shrink-0">
              <ListStart className="w-4 h-4 text-emerald-500" />
              Runtime Trace Logs
            </h3>
            
            {/* Step Counter Indicator banner */}
            <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 my-3 shrink-0 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-widest">Active Step</span>
                <span className="font-mono text-sm text-slate-700 font-bold">{currentStepIdx + 1} / {steps.length}</span>
              </div>
              <div className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase transition-colors ${
                currentStep.phase === 'Build Max-Heap' 
                  ? 'bg-blue-50 text-blue-700 border border-blue-100' 
                  : 'bg-amber-50 text-amber-700 border border-amber-100'
              }`}>
                {currentStep.phase}
              </div>
            </div>

            {/* Simulated compiler messages logs scrolling text terminal */}
            <div className="flex-1 overflow-y-auto bg-slate-950 text-[#00E5FF] font-mono text-xs p-4 rounded-lg border border-slate-800/80 shadow-md">
              <div className="space-y-2">
                <span className="text-slate-500 block text-[10px] font-sans"># Trace output logs:</span>
                <p className="leading-relaxed whitespace-pre-line text-white/90">
                  {currentStep.description}
                </p>
                {focusIdx !== undefined && (
                  <p className="text-amber-300 text-[10px] mt-1">
                    &gt; Heap index pointer currently located at node {focusIdx} (val: {activeArr[focusIdx]})
                  </p>
                )}
                {compareIdxs.length > 0 && (
                  <p className="text-[#00E5FF] text-[10px]">
                    &gt; Compiling comparisons for indexes: [{compareIdxs.join(', ')}]
                  </p>
                )}
                {swapIdxs.length > 0 && (
                  <p className="text-rose-400 text-[10px] font-bold">
                    ⚠️ swap triggered: indices [{swapIdxs.join(' ⇋ ')}]
                  </p>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Right column: Interactive Visualizations & Live compiler execution tree */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main Visualizer Board */}
          <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm space-y-6 flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h4 className="font-bold text-slate-800 text-md flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  Max-Heap Interactive Tree Canvas
                </h4>
                <p className="text-slate-400 text-xs mt-0.5">Circles outside size {heapSize} fade out to indicate finalized sorted array state.</p>
              </div>

              {/* Master Controllers Panel */}
              <div className="flex items-center gap-2 self-start sm:self-center">
                <button
                  onClick={() => {
                    setCurrentStepIdx((prev) => Math.max(0, prev - 1));
                    setIsPlaying(false);
                  }}
                  disabled={currentStepIdx === 0}
                  className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors disabled:opacity-40"
                  title="Step Back"
                >
                  <SkipBack className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all text-white ${
                    isPlaying 
                      ? 'bg-amber-600 hover:bg-amber-700' 
                      : 'bg-[#003366] hover:bg-slate-700'
                  }`}
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-3.5 h-3.5 fill-current" />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Auto Play</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    setCurrentStepIdx((prev) => Math.min(steps.length - 1, prev + 1));
                    setIsPlaying(false);
                  }}
                  disabled={currentStepIdx >= steps.length - 1}
                  className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors disabled:opacity-40"
                  title="Step Next"
                >
                  <SkipForward className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    setCurrentStepIdx(0);
                    setIsPlaying(false);
                  }}
                  className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 hover:text-rose-600 transition-colors"
                  title="Reset Algorithm"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Tree Graphical Canvas Box */}
            <div className="bg-slate-50 rounded-xl border border-slate-100 p-4 h-[240px] flex items-center justify-center relative overflow-hidden">
              <svg viewBox="0 0 500 210" className="w-full h-full">
                {/* 1. DRAW DIRECTIVITY CONNECTIONS LINES */}
                <g stroke="#CBD5E1" strokeWidth="1.5" strokeDasharray="1.5 2" opacity="0.8">
                  {activeArr.map((_, index) => {
                    if (index === 0) return null;
                    const parentIdx = Math.floor((index - 1) / 2);
                    const parentCoords = getNodeCoordinates(parentIdx, activeArr.length);
                    const childCoords = getNodeCoordinates(index, activeArr.length);

                    // Fade connection if any point falls outside the active heap size
                    const isMuted = index >= heapSize || parentIdx >= heapSize;

                    // Color line based on step comparisons
                    let lineColor = '#CBD5E1';
                    let dashStyle = '1.5 2';
                    let lineWidth = 1.2;

                    if (!isMuted) {
                      const isComparingEdge = 
                        (focusIdx === parentIdx && compareIdxs.includes(index)) ||
                        (swapIdxs.includes(parentIdx) && swapIdxs.includes(index));
                      
                      if (isComparingEdge) {
                        lineColor = swapIdxs.includes(index) ? '#EF4444' : '#3B82F6';
                        dashStyle = 'none';
                        lineWidth = 2.2;
                      } else {
                        lineColor = '#94A3B8';
                        dashStyle = 'none';
                      }
                    }

                    return (
                      <line
                        key={`line-${index}`}
                        x1={parentCoords.x}
                        y1={parentCoords.y}
                        x2={childCoords.x}
                        y2={childCoords.y}
                        stroke={lineColor}
                        strokeWidth={lineWidth}
                        strokeDasharray={dashStyle}
                        opacity={isMuted ? 0.25 : 1}
                        className="transition-all duration-300"
                      />
                    );
                  })}
                </g>

                {/* 2. RENDER INTERACTIVE NODE SPHERES */}
                <g>
                  {activeArr.map((value, index) => {
                    const coords = getNodeCoordinates(index, activeArr.length);
                    const isMuted = index >= heapSize;

                    // Compute styles depending on node role in active compiler steps:
                    let elementColor = 'bg-white text-slate-700 border-slate-300 shadow-sm';
                    let nodeStroke = '#94A3B8';
                    let nodeFill = '#FFFFFF';
                    let scaleNode = 1;

                    if (isMuted) {
                      // Already extracted of heap: Sorted state
                      nodeFill = '#ECFDF5';
                      nodeStroke = '#10B981';
                    } else {
                      // Inside active heap boundary
                      if (index === focusIdx) {
                        // Current heapify root index
                        nodeFill = '#EFF6FF';
                        nodeStroke = '#3B82F6';
                        scaleNode = 1.15;
                      } else if (compareIdxs.includes(index)) {
                        // Children candidate being compared
                        nodeFill = '#FEF3C7';
                        nodeStroke = '#D97706';
                        scaleNode = 1.1;
                      } else if (swapIdxs.includes(index)) {
                        // Values currently swapping
                        nodeFill = '#FEF2F2';
                        nodeStroke = '#EF4444';
                        scaleNode = 1.2;
                      } else {
                        nodeFill = '#1E293B';
                        nodeStroke = '#475569';
                      }
                    }

                    return (
                      <g 
                        key={`node-grp-${index}`} 
                        className="cursor-pointer group"
                      >
                        {/* Outlined highlight effect circle container */}
                        {scaleNode > 1 && (
                          <circle
                            cx={coords.x}
                            cy={coords.y}
                            r={14.5 * scaleNode}
                            fill="none"
                            stroke={nodeStroke}
                            strokeWidth="1.5"
                            strokeDasharray="2 2"
                            opacity="0.65"
                            className="animate-spin"
                            style={{ transformOrigin: `${coords.x}px ${coords.y}px`, animationDuration: '4s' }}
                          />
                        )}

                        {/* Node Bubble sphere */}
                        <circle
                          cx={coords.x}
                          cy={coords.y}
                          r={11.5}
                          fill={isMuted ? '#F8FAFC' : nodeFill}
                          stroke={nodeStroke}
                          strokeWidth={scaleNode > 1 ? 2.5 : 1.5}
                          opacity={isMuted ? 0.45 : 1}
                          className="transition-all duration-300"
                        />

                        {/* Node Integer value text */}
                        <text
                          x={coords.x}
                          y={coords.y + 3.2}
                          fontSize="8"
                          fontWeight="bold"
                          fontFamily="monospace"
                          fill={isMuted ? '#94A3B8' : (nodeFill === '#1E293B' ? '#FFFFFF' : '#1E293B')}
                          textAnchor="middle"
                          opacity={isMuted ? 0.6 : 1}
                          className="transition-all duration-300 pointer-events-none"
                        >
                          {value}
                        </text>

                        {/* Mini Index number bubble hanging beneath the node code */}
                        <text
                          x={coords.x}
                          y={coords.y - 14}
                          fontSize="5.2"
                          fontWeight="bold"
                          fontFamily="monospace"
                          fill="#94A3B8"
                          textAnchor="middle"
                          opacity={0.8}
                          className="pointer-events-none"
                        >
                          {`idx:${index}`}
                        </text>

                        {/* Popover overlay label indicating roles on hovering */}
                        <title>
                          Index: {index} | Value: {value} 
                          {isMuted ? ' (Finalized Sorted position)' : ''}
                          {index === focusIdx ? ' (Active Parent)' : ''}
                          {compareIdxs.includes(index) ? ' (Comparing Child)' : ''}
                        </title>
                      </g>
                    );
                  })}
                </g>
              </svg>
            </div>

            {/* Flat array block visual representation */}
            <div className="space-y-2 pt-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Flat Array Representation Block</span>
              
              <div className="flex flex-wrap gap-2.5 items-center bg-slate-50 p-3 rounded-lg border border-slate-100 font-mono text-xs">
                {activeArr.map((val, idx) => {
                  const isSorted = idx >= heapSize;
                  const isFocus = idx === focusIdx;
                  const isCompare = compareIdxs.includes(idx);
                  const isSwap = swapIdxs.includes(idx);

                  let blockColor = 'bg-white border-slate-200 text-slate-700 hover:scale-105';
                  if (isSorted) {
                    blockColor = 'bg-emerald-50 border-emerald-200 text-emerald-800 shadow-sm opacity-55';
                  } else if (isSwap) {
                    blockColor = 'bg-rose-50 border-rose-300 text-rose-700 animate-pulse font-black scale-105 ring-2 ring-rose-300/30';
                  } else if (isCompare) {
                    blockColor = 'bg-amber-50 border-amber-300 text-amber-700 font-bold scale-105';
                  } else if (isFocus) {
                    blockColor = 'bg-blue-50 border-blue-300 text-blue-700 font-bold scale-105 ring-2 ring-blue-300/20';
                  }

                  return (
                    <div 
                      key={`block-${idx}`}
                      className={`h-10 w-12 rounded-md border flex flex-col items-center justify-center relative transition-all cursor-default ${blockColor}`}
                      title={`Idx: ${idx} | Val: ${val}`}
                    >
                      <span className="text-sm font-bold">{val}</span>
                      <span className="text-[7.5px] text-slate-400 absolute bottom-0">{idx}</span>

                      {/* Small crown on top of root element */}
                      {idx === 0 && !isSorted && (
                        <span className="absolute -top-1.5 text-[8px]" title="Heap Root Node">👑</span>
                      )}
                    </div>
                  );
                })}

                {/* Legend markers helper */}
                <div className="flex-1 min-w-[200px] flex flex-wrap gap-x-4 gap-y-1 justify-end ml-auto text-[9.5px] uppercase font-bold text-slate-400 font-sans tracking-wide">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 bg-blue-100 border border-blue-400 rounded" />
                    <span>Parent Focus</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 bg-amber-100 border border-amber-400 rounded" />
                    <span>Comparing</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 bg-rose-100 border border-rose-400 rounded animate-pulse" />
                    <span>Swapping</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 bg-emerald-100 border border-emerald-400 opacity-60 rounded" />
                    <span>Sorted Area</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Interactive code tracker snippet */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-lg p-6 text-white space-y-4 font-mono">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3 font-sans">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-amber-400" />
                <h4 className="font-bold text-sm text-slate-200">Interactive C++ / C compiler dry-run trace</h4>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#00E5FF] bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                O(N log N) Max-Heap Source
              </span>
            </div>

            {/* Snippet board rendering */}
            <div className="bg-slate-950/80 p-4 rounded-lg border border-slate-800 text-xs text-slate-400 overflow-x-auto select-none space-y-1">
              {codeSnippets.map((item) => {
                const isLineHighlight = getLineHighlightStatus(item.line, currentStep);

                return (
                  <div 
                    key={item.line} 
                    className={`flex items-start gap-4 py-0.5 px-2 rounded-md transition-colors ${
                      isLineHighlight 
                        ? 'bg-blue-900/40 text-[#ffffff] font-bold border-l-4 border-blue-500 -ml-2' 
                        : 'opacity-85'
                    }`}
                  >
                    <span className="w-5 text-right font-mono text-slate-600 border-r border-slate-800 pr-2 select-none">
                      {item.line}
                    </span>
                    <pre className="font-mono text-xs whitespace-pre select-all leading-normal">
                      {item.text}
                    </pre>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-sans rounded-lg bg-slate-950 p-3 border border-slate-800/60 leading-relaxed italic">
              <span className="text-amber-300 font-bold not-italic">Pro tip:</span>
              Watch the lines highlight in real time corresponding with the comparison and swap steps taking place in the heap structure visuals above.
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
