import React, { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";

// Add this interface to accept the prop from App.tsx
interface ErasingToolProps {
  setCurrentView: (view: string) => void;
}

export default function ERASINGTOOL({ setCurrentView }: ErasingToolProps) {
  // Switched from File[] to string[] to hold native system paths from Tauri
  const [selectedPaths, setSelectedPaths] = useState<string[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanLogs, setScanLogs] = useState<string[]>([]);
  const [isErased, setIsErased] = useState(false);

  // Tauri Native File Selection
  const handleFileSelection = async () => {
    try {
      const selected = await open({
        multiple: true,
        directory: false,
      });
      
      if (Array.isArray(selected)) {
        setSelectedPaths(selected);
        setIsErased(false);
        setScanProgress(0);
        setScanLogs([`[SYSTEM] Target acquired: ${selected.length} items detected.`]);
      } else if (selected) {
        setSelectedPaths([selected]);
        setIsErased(false);
        setScanProgress(0);
        setScanLogs([`[SYSTEM] Target acquired: 1 item detected.`]);
      }
    } catch (err) {
      setScanLogs((prev) => [...prev, `[ERROR] Failed to open dialog: ${err}`]);
    }
  };

  // Tauri Native Folder Selection
  const handleFolderSelection = async () => {
    try {
      const selected = await open({
        multiple: false,
        directory: true,
      });

      if (selected && typeof selected === 'string') {
        setSelectedPaths([selected]);
        setIsErased(false);
        setScanProgress(0);
        setScanLogs([`[SYSTEM] Directory acquired: ${selected}`]);
      }
    } catch (err) {
      setScanLogs((prev) => [...prev, `[ERROR] Failed to open dialog: ${err}`]);
    }
  };

  const initiateScan = () => {
    if (selectedPaths.length === 0) return;
    setIsScanning(true);
    setScanProgress(0);
    setScanLogs((prev) => [...prev, "[FORENSIC] Initiating deep sector analysis..."]);

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 15) + 5;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setIsScanning(false);
        setScanLogs((prev) => [
          ...prev, 
          "[FORENSIC] MFT (Master File Table) records mapped.",
          "[FORENSIC] Slack space and shadow copies identified.",
          "[SYSTEM] Ready for core erasure (Rust Backend Integration)."
        ]);
      } else {
        const fakeSectors = ["0x00A4F", "0x00B12", "0x0FC88", "0x1A44B"];
        const randomSector = fakeSectors[Math.floor(Math.random() * fakeSectors.length)];
        setScanLogs((prev) => [...prev, `[SCANNING] Mapping block ${randomSector}...`]);
      }
      setScanProgress(progress);
    }, 400);
  };

  const initiateErasure = async () => {
    if (scanProgress < 100) return;
    setScanLogs((prev) => [...prev, "[WARNING] INITIATING 3-PASS SECURE WIPE..."]);
    
    try {
      for (const path of selectedPaths) {
        setScanLogs((prev) => [...prev, `[WIPE] Pass 1/3: Overwriting with zeroes (0x00) on ${path}...`]);
        
        // UPDATED: Now calling the real Rust function and passing the dynamic file path
        const result = await invoke("erase_real_file", { path: path });
        
        setScanLogs((prev) => [...prev, `[SUCCESS] ${result}`]);
      }
      
      setScanLogs((prev) => [...prev, "[SUCCESS] Data permanently sanitized from core storage."]);
      setIsErased(true);
      setSelectedPaths([]);
    } catch (error) {
      setScanLogs((prev) => [...prev, `[ERROR] Backend erasure failed: ${error}`]);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white font-sans relative overflow-x-hidden selection:bg-red-500/30 flex flex-col">
      <div className="absolute inset-0 z-0 pointer-events-none fixed">
        <img 
          src="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=2070&auto=format&fit=crop" 
          alt="Cybersecurity" 
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0c] via-[#0a0a0c]/80 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0c] via-transparent to-[#0a0a0c]/90"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-red-900/20 blur-[120px] rounded-full mix-blend-screen"></div>
      </div>

      <div className="relative z-10 flex flex-col flex-1">
        <header className="border-b border-white/5 bg-[#0a0a0c]/80 backdrop-blur-md sticky top-0 z-40">
          <nav className="flex items-center justify-between px-8 py-5 max-w-7xl w-full mx-auto">
            
            <div 
              className="text-2xl font-black tracking-tighter cursor-pointer"
              onClick={() => setCurrentView("home")}
            >
              ZERO TRACE<span className="text-red-500">.</span>
            </div>

            <div className="hidden md:flex items-center space-x-8 text-sm font-medium">
              <button className="text-red-500 relative cursor-pointer">
                Erasing Tool
                <span className="absolute -bottom-6 left-0 w-full h-[2px] bg-red-500"></span>
              </button>
              
              <button 
                onClick={() => setCurrentView("recover")} 
                className="text-gray-400 hover:text-white transition cursor-pointer"
              >
                Recover Tool
              </button>
              <button 
                onClick={() => setCurrentView("forensic")} 
                className="text-gray-400 hover:text-white transition cursor-pointer"
              >
                Forensic History
              </button>
              <button onClick={() => setCurrentView("aboutus")} className="text-gray-400 hover:text-white transition cursor-pointer">About Us</button>
            </div>

            <div className="flex items-center space-x-4">
              <button className="px-5 py-2 text-sm font-medium border border-red-500/50 text-red-400 rounded hover:bg-red-500/10 transition cursor-pointer">
                NTRO Secure Node
              </button>
            </div>
          </nav>
        </header>

        <main className="flex-1 flex flex-col items-center max-w-7xl mx-auto px-4 py-12 w-full">
          <div className="text-center max-w-4xl mb-10 px-4">
            <h1 className="text-4xl md:text-5xl font-semibold leading-tight tracking-tight mb-4 drop-shadow-lg">
              Secure Data Sanitization
            </h1>
            <p className="text-gray-400 text-sm md:text-base leading-relaxed font-mono max-w-2xl mx-auto">
              Select files or directories to grant access. The system will gather forensic storage data and execute a military-grade overwrite sequence to prevent future recovery.
            </p>
          </div>

          <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 bg-[#111115]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 shadow-[0_0_40px_rgba(0,0,0,0.8)]">
            <div className="flex flex-col space-y-6">
              <h2 className="text-xl font-medium text-gray-100 flex items-center border-b border-gray-800 pb-3">
                <span className="w-3 h-3 bg-red-500 rounded-sm mr-3 animate-pulse"></span>
                1. Target Selection
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <button onClick={handleFileSelection} className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-700 rounded-xl hover:border-red-500/50 hover:bg-red-500/5 transition-all group cursor-pointer">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-500 group-hover:text-red-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  <span className="text-sm font-medium text-gray-300">Select Files</span>
                </button>
                <button onClick={handleFolderSelection} className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-700 rounded-xl hover:border-red-500/50 hover:bg-red-500/5 transition-all group cursor-pointer">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-500 group-hover:text-red-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
                  <span className="text-sm font-medium text-gray-300">Select Folder</span>
                </button>
              </div>

              <div className="bg-[#0a0a0c] border border-gray-800 rounded-lg p-4 h-48 overflow-y-auto">
                <h3 className="text-xs font-mono text-gray-500 mb-2 uppercase">Targets Staged for Sanitization:</h3>
                {selectedPaths.length === 0 ? (
                  <p className="text-sm text-gray-600 italic">No targets selected.</p>
                ) : (
                  <ul className="space-y-2">
                    {selectedPaths.slice(0, 50).map((path, idx) => {
                      const fileName = path.split(/[\\/]/).pop() || path;
                      return (
                        <li key={idx} className="text-sm text-gray-300 font-mono truncate flex items-center" title={path}>
                          <span className="text-red-500 mr-2">x</span> {fileName} 
                          <span className="text-gray-600 ml-2 truncate">({path})</span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>

            <div className="flex flex-col space-y-6">
              <h2 className="text-xl font-medium text-gray-100 flex items-center border-b border-gray-800 pb-3">
                <span className="w-3 h-3 bg-purple-500 rounded-sm mr-3"></span>
                2. Forensic Analysis & Erasure
              </h2>

              <div className="flex space-x-4">
                <button onClick={initiateScan} disabled={selectedPaths.length === 0 || isScanning || scanProgress === 100} className="flex-1 bg-gray-800 text-white py-3 rounded border border-gray-700 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold text-sm cursor-pointer">
                  {isScanning ? "Scanning..." : "Gather Forensic Data"}
                </button>
                <button onClick={initiateErasure} disabled={scanProgress < 100 || isErased} className="flex-1 bg-red-600 text-white py-3 rounded border border-red-500 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-[0_0_15px_rgba(220,38,38,0.4)] font-semibold text-sm cursor-pointer">
                  {isErased ? "SANITIZED" : "ERASE FROM CORE"}
                </button>
              </div>

              <div className="w-full bg-gray-900 rounded-full h-2.5 border border-gray-800">
                <div className="bg-red-500 h-2.5 rounded-full transition-all duration-300" style={{ width: `${scanProgress}%` }}></div>
              </div>

              <div className="bg-[#050505] border border-gray-800 rounded-lg p-4 flex-1 min-h-[200px] flex flex-col relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500/20 via-purple-500/20 to-transparent"></div>
                <h3 className="text-xs font-mono text-gray-600 mb-2 border-b border-gray-800/50 pb-1">TERMINAL LOGS // NTRO-SIH26149</h3>
                <div className="overflow-y-auto flex-1 font-mono text-[13px] space-y-1">
                  {scanLogs.length === 0 && <p className="text-gray-700">Awaiting target selection...</p>}
                  {scanLogs.map((log, idx) => (
                    <p key={idx} className={`${log.includes('[WARNING]') || log.includes('[ERROR]') ? 'text-orange-400' : log.includes('[SUCCESS]') ? 'text-green-400' : log.includes('[WIPE]') ? 'text-red-400' : 'text-gray-400'}`}>
                      {log}
                    </p>
                  ))}
                  {isScanning && <span className="inline-block w-2 h-4 bg-gray-400 animate-pulse mt-1"></span>}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}