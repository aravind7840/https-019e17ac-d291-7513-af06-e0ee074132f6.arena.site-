import { useState, useEffect } from 'react';
import {
  Layers,
  Calculator,
  Cpu,
  History,
  Activity,
  User,
  LogOut,
  Sun,
  Moon,
  Clock,
  Radio,
  BookOpen,
  Keyboard,
  Compass,
  Star,
  CornerDownRight,
  Database,
  Terminal as TermIcon,
  ChevronRight,
  Zap,
} from 'lucide-react';

// Components
import { BasicCalc } from './components/BasicCalc';
import { ScientificCalc } from './components/ScientificCalc';
import { GraphPlotter } from './components/GraphPlotter';
import { UnitConverter } from './components/UnitConverter';
import { CurrencyConverter } from './components/CurrencyConverter';
import { AIMathSolver } from './components/AIMathSolver';
import { HistoryPanel } from './components/HistoryPanel';
import { ConsoleHUD } from './components/ConsoleHUD';
import { AuthModal } from './components/AuthModal';
import { VoiceHelper } from './components/VoiceHelper';

import { mockBackend, MockUser, CalculationRecord } from './utils/mockBackend';

type WorkspaceTab = 'dashboard' | 'basic' | 'scientific' | 'graph' | 'unit' | 'currency' | 'ai-solver' | 'history';

export default function App() {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('dashboard');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [currentUser, setCurrentUser] = useState<MockUser | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeKeyboard, setActiveKeyboard] = useState(true);
  const [lastKeyPressed, setLastKeyPressed] = useState<string | null>(null);
  const [dbCounter, setDbCounter] = useState(0); // Trigger reload in child components on MongoDB updates
  const [showConsole, setShowConsole] = useState(true);
  const [currentTime, setCurrentTime] = useState('');
  const [serverLatency, setServerLatency] = useState(14);
  const [recentCalculations, setRecentCalculations] = useState<CalculationRecord[]>([]);

  // Favorite Formulas Lib
  const formulaLib = [
    { name: 'Quadratic Solver', formula: 'x^2 - 5*x + 6 = 0', type: 'ai-solver' },
    { name: 'Trig Identity', formula: 'sin(pi / 4) * sqrt(2)', type: 'scientific' },
    { name: 'Cosine Dampener', formula: 'cos(x) * e^(-0.1 * x)', type: 'graph' },
    { name: 'Euler Constant', formula: 'e^pi - pi', type: 'scientific' },
    { name: 'Polynomial Curve', formula: 'x^3 - 3*x', type: 'graph' },
  ];

  // Tick clock & simulate network latency fluctuations
  useEffect(() => {
    setCurrentUser(mockBackend.getCurrentUser());
    updateTime();

    const timeInterval = setInterval(updateTime, 1000);
    const latencyInterval = setInterval(() => {
      setServerLatency(Math.floor(10 + Math.random() * 15));
    }, 4000);

    return () => {
      clearInterval(timeInterval);
      clearInterval(latencyInterval);
    };
  }, []);

  // Fetch recent MongoDB calculations for the dashboard
  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const data = await mockBackend.request('GET', '/api/calculations');
        setRecentCalculations(data.slice(0, 4));
      } catch (e) {
        console.error(e);
      }
    };
    fetchRecent();
  }, [dbCounter, activeTab]);

  const updateTime = () => {
    const d = new Date();
    setCurrentTime(
      d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) +
      '.' +
      d.getMilliseconds().toString().padStart(3, '0')
    );
  };

  const handleKeyPressVisual = (key: string) => {
    setLastKeyPressed(key);
    setTimeout(() => setLastKeyPressed(null), 300);
  };

  const handleLogout = async () => {
    await mockBackend.request('POST', '/api/auth/logout');
    setCurrentUser(null);
    setDbCounter((prev) => prev + 1);
  };

  const loadFormulaPreset = (formula: string, type: string) => {
    navigator.clipboard.writeText(formula);
    alert(`Loaded & Copied formula: "${formula}" to clipboard! Switch input focus to insert.`);
    if (type === 'ai-solver') {
      setActiveTab('ai-solver');
    } else if (type === 'scientific') {
      setActiveTab('scientific');
    } else if (type === 'graph') {
      setActiveTab('graph');
    }
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${
      theme === 'dark' ? 'bg-[#06070d] text-gray-200 cyber-grid' : 'bg-[#f8fafc] text-gray-800'
    }`}>
      
      {/* Dynamic scanline visual effect in dark mode */}
      {theme === 'dark' && <div className="absolute inset-0 pointer-events-none scanline-overlay opacity-10 z-10" />}

      {/* High-Tech Navbar */}
      <header className={`px-6 py-3 border-b shrink-0 flex items-center justify-between relative z-20 ${
        theme === 'dark' ? 'bg-slate-950/90 border-cyan-500/10' : 'bg-white border-gray-200 shadow-sm'
      }`}>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-purple-600 to-pink-500 flex items-center justify-center text-white font-bold font-orbitron shadow-lg shadow-cyan-500/10">
            X
          </div>
          <div>
            <h1 className="text-base font-black font-orbitron tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-500">
              CALCX PRO
            </h1>
            <div className="flex items-center gap-1.5 text-[8px] text-gray-500 font-mono tracking-widest uppercase">
              <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping"></span>
              AI-POWERED FULL-STACK HUB
            </div>
          </div>
        </div>

        {/* Center telemetry clock HUD */}
        <div className="hidden lg:flex items-center gap-6 font-mono text-[11px] text-gray-400">
          <div className="flex items-center gap-1.5">
            <Clock size={12} className="text-cyan-400 animate-pulse" />
            <span>UTC_T: <span className="text-white font-semibold">{currentTime}</span></span>
          </div>
          <div className="flex items-center gap-1.5">
            <Radio size={12} className="text-pink-400 animate-bounce" />
            <span>MONGO_PING: <span className="text-pink-400 font-semibold">{serverLatency}ms</span></span>
          </div>
          <div className="flex items-center gap-1.5">
            <Database size={12} className="text-purple-400" />
            <span>NODE_ENV: <span className="text-purple-400 font-semibold">PRODUCTION</span></span>
          </div>
        </div>

        {/* Top actions & auth button */}
        <div className="flex items-center gap-3">
          
          {/* Keyboard capture indicator */}
          <button
            onClick={() => setActiveKeyboard(!activeKeyboard)}
            className={`px-2.5 py-1 rounded border text-[10px] font-orbitron transition-all cursor-pointer flex items-center gap-1.5 ${
              activeKeyboard
                ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400'
                : 'border-white/5 bg-slate-900 text-gray-500'
            }`}
            title="Toggle Direct Keyboard binds"
          >
            <Keyboard size={12} />
            <span>KB: {activeKeyboard ? 'BIND_ON' : 'BIND_OFF'}</span>
          </button>

          {/* Theme switcher */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className={`p-2 rounded-lg border transition-all cursor-pointer ${
              theme === 'dark' 
                ? 'bg-slate-900 border-white/10 text-amber-400 hover:border-amber-400' 
                : 'bg-gray-100 border-gray-300 text-purple-600 hover:border-purple-600 shadow'
            }`}
            title="Toggle theme mode"
          >
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          </button>

          {/* User authentication account badge */}
          {currentUser ? (
            <div className="flex items-center gap-2 bg-slate-900/60 border border-white/10 px-3 py-1.5 rounded-xl">
              <span className="text-sm">{currentUser.avatar || '🤖'}</span>
              <div className="hidden sm:block text-left leading-none">
                <div className="text-xs font-orbitron text-white font-semibold">{currentUser.username}</div>
                <span className="text-[8px] text-purple-400 font-bold font-mono tracking-wider">JWT VERIFIED</span>
              </div>
              <button
                onClick={handleLogout}
                className="p-1 text-gray-500 hover:text-rose-400 cursor-pointer"
                title="Logout session"
              >
                <LogOut size={13} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white rounded-xl text-xs font-orbitron font-semibold tracking-wider flex items-center gap-1.5 shadow shadow-cyan-500/10 cursor-pointer"
            >
              <User size={13} />
              <span>SECURE LOGIN</span>
            </button>
          )}

        </div>
      </header>

      {/* Main Container Workspace */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* Left Side Navigation Menu */}
        <nav className={`w-full md:w-64 shrink-0 p-4 border-r flex flex-col justify-between ${
          theme === 'dark' ? 'bg-[#0b0e17]/80 border-cyan-500/10' : 'bg-white border-gray-200'
        }`}>
          <div className="space-y-4">
            
            {/* Nav Header Section */}
            <div className="px-3 py-1 text-[10px] text-gray-500 font-orbitron tracking-widest uppercase">
              WORKSTATION SYSTEMS
            </div>

            {/* Menu options */}
            <div className="space-y-1">
              {[
                { id: 'dashboard', name: 'Dashboard Hub', icon: Compass, color: 'text-cyan-400' },
                { id: 'basic', name: 'Basic Calculator', icon: Calculator, color: 'text-cyan-400' },
                { id: 'scientific', name: 'Scientific Engine', icon: Layers, color: 'text-purple-400' },
                { id: 'graph', name: 'Interactive Graph', icon: Activity, color: 'text-pink-400' },
                { id: 'unit', name: 'Unit Converter', icon: Compass, color: 'text-emerald-400' },
                { id: 'currency', name: 'Currency Desk', icon: Zap, color: 'text-amber-400' },
                { id: 'ai-solver', name: 'AI Math Solver', icon: Cpu, color: 'text-purple-400 animate-pulse' },
                { id: 'history', name: 'MongoDB Records', icon: History, color: 'text-pink-400' },
              ].map((m) => {
                const Icon = m.icon;
                const isActive = activeTab === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setActiveTab(m.id as WorkspaceTab)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-orbitron tracking-wide transition-all cursor-pointer ${
                      isActive
                        ? theme === 'dark'
                          ? 'bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 shadow-md shadow-cyan-500/5'
                          : 'bg-cyan-50 border border-cyan-100 text-cyan-600 font-semibold shadow-sm'
                        : theme === 'dark'
                          ? 'border border-transparent text-gray-400 hover:text-white hover:bg-white/5'
                          : 'border border-transparent text-gray-600 hover:text-black hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon size={14} className={isActive ? m.color : 'text-gray-500'} />
                      <span>{m.name}</span>
                    </div>
                    {isActive && <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sidebar Telemetry widgets */}
          <div className="hidden md:block pt-4 border-t border-white/5 space-y-3">
            <div className="bg-slate-950/60 p-3.5 rounded-xl border border-white/5 space-y-2">
              <div className="flex justify-between items-center text-[10px] text-gray-500 font-orbitron">
                <span>SERVER METRICS</span>
                <span className="text-cyan-400">ONLINE</span>
              </div>
              <div className="space-y-1 text-[9px] font-mono text-gray-400">
                <div className="flex justify-between">
                  <span>CPU LOAD:</span>
                  <span className="text-white">{(2.1 + Math.random() * 2).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>MEM CLUSTER:</span>
                  <span className="text-white">26.4 MB</span>
                </div>
              </div>
            </div>

            {/* Toggle Terminal Button */}
            <button
              onClick={() => setShowConsole(!showConsole)}
              className="w-full py-2 bg-slate-950 border border-white/10 rounded-xl text-[10px] text-gray-400 font-orbitron tracking-wider hover:border-cyan-500/50 hover:text-cyan-400 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <TermIcon size={12} className="text-cyan-400" />
              <span>{showConsole ? 'CLOSE NODE DRAWER' : 'REVEAL NODE DRAWER'}</span>
            </button>
          </div>
        </nav>

        {/* Central Workstation / Page Area */}
        <main className="flex-1 flex flex-col md:flex-row overflow-y-auto">
          
          <div className="flex-1 p-6 space-y-6 overflow-y-auto">
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                
                {/* Welcome Banner */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-900/40 via-purple-900/30 to-slate-950 p-8 border border-cyan-500/20 shadow-xl">
                  {/* Glowing light visual */}
                  <div className="absolute -top-10 -right-10 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
                  
                  <div className="relative z-10 max-w-2xl">
                    <div className="flex items-center gap-1 text-xs text-cyan-400 font-orbitron font-semibold uppercase tracking-wider mb-2">
                      <Zap size={14} className="text-cyan-400 animate-bounce" />
                      SYSTEM INTEGRATED PLATFORM ACTIVE
                    </div>
                    <h2 className="text-2xl md:text-3xl font-black font-orbitron text-white leading-tight">
                      Welcome to CalcX Pro Analytics Hub
                    </h2>
                    <p className="text-xs md:text-sm text-gray-400 mt-2 leading-relaxed">
                      A high-precision, AI-powered computational matrix platform combining basic calculations, complex trigonometry equations, instant multi-category dimensions scaling, forex feeds, and neural network symbolic solvers.
                    </p>

                    <div className="flex flex-wrap gap-2.5 mt-5">
                      <button
                        onClick={() => setActiveTab('basic')}
                        className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl text-xs font-orbitron font-bold tracking-wide transition-all shadow-lg shadow-cyan-500/20 cursor-pointer"
                      >
                        LAUNCH BASIC PAD
                      </button>
                      <button
                        onClick={() => setActiveTab('scientific')}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-orbitron font-bold tracking-wide transition-all shadow-lg shadow-purple-600/20 cursor-pointer"
                      >
                        LAUNCH SCIENTIFIC
                      </button>
                    </div>
                  </div>
                </div>

                {/* Grid stats & info widgets */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-[#0b0e17]/80 border border-white/5 p-5 rounded-2xl flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                      <Calculator size={20} />
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-500 font-orbitron">MONGODB RECORDS</div>
                      <div className="text-lg font-bold font-orbitron text-white mt-0.5">
                        {recentCalculations.length > 0 ? recentCalculations.length : '0'} items
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#0b0e17]/80 border border-white/5 p-5 rounded-2xl flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
                      <Cpu size={20} className="animate-spin text-purple-400" />
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-500 font-orbitron">AI SYSTEM STATUS</div>
                      <div className="text-lg font-bold font-orbitron text-emerald-400 mt-0.5">
                        SECURED & ONLINE
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#0b0e17]/80 border border-white/5 p-5 rounded-2xl flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400 shrink-0">
                      <Activity size={20} />
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-500 font-orbitron">TELEMETRY BANDWIDTH</div>
                      <div className="text-lg font-bold font-orbitron text-white mt-0.5">
                        4.2 Gbps
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Activities Feed + System Features cards layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Left block: features cards list */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold font-orbitron text-gray-400 uppercase tracking-widest">
                      SYSTEM INTEGRATIONS CAPABILITIES
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { title: 'Interactive Plotter', desc: 'Plot equations like sin(x) * 2 dynamically with coordinate hovers.', tab: 'graph' },
                        { title: 'Forex Converter', desc: 'Simulated real-time rate grids for global currencies.', tab: 'currency' },
                        { title: 'Step-by-Step Solver', desc: 'Detailed explanation proofs for algebra & calculus rules.', tab: 'ai-solver' },
                        { title: 'Premium History', desc: 'Star, filter, or export PDF summaries from database.', tab: 'history' }
                      ].map((f, i) => (
                        <div
                          key={i}
                          onClick={() => setActiveTab(f.tab as WorkspaceTab)}
                          className="bg-[#0b0e17]/40 border border-white/5 hover:border-cyan-500/30 p-4 rounded-xl transition-all hover:scale-[1.02] cursor-pointer"
                        >
                          <h4 className="text-xs font-bold font-orbitron text-white flex items-center gap-1.5">
                            <CornerDownRight size={12} className="text-cyan-400" />
                            <span>{f.title}</span>
                          </h4>
                          <p className="text-[11px] text-gray-400 mt-1 font-mono leading-relaxed">{f.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right block: Recent math actions list from database */}
                  <div className="bg-[#0b0e17]/80 border border-white/5 p-5 rounded-2xl space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xs font-bold font-orbitron text-gray-400 uppercase tracking-widest">
                        RECENT DATABASE ENTRIES
                      </h3>
                      <button
                        onClick={() => setActiveTab('history')}
                        className="text-[9px] text-cyan-400 hover:text-cyan-300 font-orbitron tracking-widest uppercase font-semibold cursor-pointer"
                      >
                        VIEW FULL MONGODB ➔
                      </button>
                    </div>

                    <div className="space-y-2">
                      {recentCalculations.length === 0 ? (
                        <div className="py-8 text-center text-xs text-gray-500 font-orbitron border border-dashed border-white/5 rounded-xl">
                          Database collections are currently empty.
                        </div>
                      ) : (
                        recentCalculations.map((item) => (
                          <div
                            key={item._id}
                            className="p-3 bg-slate-950/45 rounded-xl border border-white/5 flex items-center justify-between text-xs"
                          >
                            <div className="space-y-0.5">
                              <span className="text-[8px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-1.5 py-0.5 rounded uppercase font-bold font-orbitron">
                                {item.type}
                              </span>
                              <div className="font-mono text-gray-300 mt-1 text-[11px]">{item.expression}</div>
                            </div>
                            <div className="font-orbitron font-bold text-cyan-400 text-right">
                              = {item.result}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                </div>

              </div>
            )}

            {activeTab === 'basic' && (
              <BasicCalc
                onCalculationSaved={() => setDbCounter((prev) => prev + 1)}
                activeKeyboard={activeKeyboard}
                onKeyPressVisual={handleKeyPressVisual}
              />
            )}

            {activeTab === 'scientific' && (
              <ScientificCalc
                onCalculationSaved={() => setDbCounter((prev) => prev + 1)}
                activeKeyboard={activeKeyboard}
                onKeyPressVisual={handleKeyPressVisual}
              />
            )}

            {activeTab === 'graph' && <GraphPlotter />}

            {activeTab === 'unit' && <UnitConverter />}

            {activeTab === 'currency' && <CurrencyConverter />}

            {activeTab === 'ai-solver' && <AIMathSolver />}

            {activeTab === 'history' && (
              <HistoryPanel
                refreshTrigger={dbCounter}
                onDbAction={() => setDbCounter((prev) => prev + 1)}
              />
            )}

          </div>

          {/* Right helper panel sidebar */}
          <aside className={`w-full md:w-80 shrink-0 p-6 border-l space-y-6 ${
            theme === 'dark' ? 'bg-[#0b0e17]/60 border-cyan-500/10' : 'bg-slate-50 border-gray-200'
          }`}>
            
            {/* Real-time visual keystroke logs */}
            {activeKeyboard && (
              <div className="bg-[#0b0d18] border border-cyan-500/15 p-4 rounded-xl relative overflow-hidden">
                <div className="flex items-center gap-1 text-[10px] text-cyan-400 font-orbitron uppercase mb-1.5">
                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping"></span>
                  KEYBOARD CAPTURE HUD
                </div>
                <div className="h-10 flex items-center justify-center border border-white/5 rounded-lg bg-slate-950 font-orbitron text-sm font-bold text-white tracking-widest uppercase">
                  {lastKeyPressed ? (
                    <span className="text-cyan-400 animate-pulse text-lg">
                      [ {lastKeyPressed} ]
                    </span>
                  ) : (
                    <span className="text-gray-600 text-xs font-normal">No key triggered</span>
                  )}
                </div>
              </div>
            )}

            {/* Voice Input Widget helper */}
            <VoiceHelper
              onTranscriptResolved={(formula) => {
                // Apply formula to active calc pages if applicable
                // Alert and navigate
                alert(`Voice parsed formula applied: ${formula}`);
                setActiveTab('scientific');
              }}
            />

            {/* Favorite Formulas Library presets quick fill */}
            <div className="bg-slate-950/60 p-4.5 rounded-xl border border-white/5 space-y-3">
              <div className="flex items-center gap-1 text-[10px] text-purple-400 font-orbitron uppercase">
                <BookOpen size={12} className="text-purple-400" />
                FORMULAS THEOREM LIBRARY
              </div>

              <div className="space-y-1.5">
                {formulaLib.map((f, i) => (
                  <button
                    key={i}
                    onClick={() => loadFormulaPreset(f.formula, f.type)}
                    className="w-full text-left p-2.5 rounded bg-[#101423] hover:bg-purple-500/5 hover:border-purple-500/30 border border-white/5 transition-all text-[11px] flex items-center justify-between cursor-pointer group"
                  >
                    <div>
                      <div className="font-semibold text-gray-200 font-orbitron">{f.name}</div>
                      <div className="font-mono text-gray-400 mt-0.5">{f.formula}</div>
                    </div>
                    <ChevronRight size={12} className="text-gray-500 group-hover:text-purple-400 transition-colors" />
                  </button>
                ))}
              </div>
            </div>

            {/* Simulated Server Security Telemetry badge */}
            <div className="bg-slate-950/60 p-4.5 rounded-xl border border-white/5 space-y-2 text-xs">
              <div className="text-[10px] text-pink-400 font-orbitron uppercase flex items-center gap-1">
                <Star size={12} className="text-pink-400" />
                SECURITY PARADIGM
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed font-mono">
                System is fully compliant under sandbox server guidelines. API calls are logged cryptographically via local middleware tokens.
              </p>
            </div>

          </aside>

        </main>

      </div>

      {/* Floating Bottom Console Logs Drawer (REST routes & MongoDB shell logs) */}
      {showConsole && (
        <div className="border-t border-cyan-500/20 shadow-2xl relative z-10">
          <ConsoleHUD />
        </div>
      )}

      {/* Authentication JWT Modal Popup */}
      {showAuthModal && (
        <AuthModal
          onAuthSuccess={(user) => {
            setCurrentUser(user);
            setDbCounter((prev) => prev + 1);
          }}
          onClose={() => setShowAuthModal(false)}
        />
      )}

    </div>
  );
}
