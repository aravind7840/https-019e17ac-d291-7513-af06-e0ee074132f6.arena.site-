import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Database, ShieldCheck, Activity } from 'lucide-react';
import { mockBackend, ApiLog } from '../utils/mockBackend';

export function ConsoleHUD() {
  const [logs, setLogs] = useState<ApiLog[]>([]);
  const [activeTab, setActiveTab] = useState<'logs' | 'db'>('logs');
  const [stats, setStats] = useState(mockBackend.getDbStats());
  const [command, setCommand] = useState('');
  const [terminalOutput, setTerminalOutput] = useState<string[]>([
    'CalcX Pro API Server v1.4.0 (Express.js) started.',
    'MongoDB Database connected at mongodb://127.0.0.1:27017/calcx_db',
    'Type "help" in command line to view list of custom shell commands.'
  ]);

  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Subscribe to mock backend logs
    const unsubscribeLogs = mockBackend.subscribeToLogs((newLog) => {
      setLogs((prev) => [newLog, ...prev].slice(0, 50));
      // Log in command terminal too
      const statusColor = newLog.status >= 400 ? '🔴' : '🟢';
      setTerminalOutput((prev) => [
        ...prev,
        `${statusColor} [${newLog.timestamp}] ${newLog.method} ${newLog.url} - ${newLog.status} (${newLog.latencyMs}ms) | DB: ${newLog.dbQuery}`
      ]);
    });

    // Subscribe to MongoDB mock database changes
    const unsubscribeDb = mockBackend.subscribeToDbChanges(() => {
      setStats(mockBackend.getDbStats());
    });

    return () => {
      unsubscribeLogs();
      unsubscribeDb();
    };
  }, []);

  const executeCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim()) return;

    const cmd = command.trim().toLowerCase();
    let reply = '';

    if (cmd === 'help') {
      reply = `Available commands:
  - help           : Show this help manual
  - show dbs       : List active MongoDB collections & sizes
  - db.users.find(): Return mock authentication user accounts
  - db.history.find(): Display complete database calculation list
  - clear          : Clear terminal system log screen
  - mock-error     : Induce a 500 Express Internal Server Error
  - stats          : Show hardware memory & uptime values`;
    } else if (cmd === 'show dbs') {
      const liveStats = mockBackend.getDbStats();
      reply = `Databases list:
  - admin       (0.01 MB)
  - config      (0.02 MB)
  - calcx_db:
    * collections: [users (${liveStats.usersCount} docs), history (${liveStats.recordsCount} docs)]
    * size       : ${liveStats.databaseSizeKb} KB
    * status     : ONLINE`;
    } else if (cmd === 'db.users.find()') {
      const users = localStorage.getItem('calcx_mongodb_users') || '[]';
      reply = `db.users.find():\n${JSON.stringify(JSON.parse(users), null, 2)}`;
    } else if (cmd === 'db.history.find()') {
      const history = localStorage.getItem('calcx_mongodb_history') || '[]';
      reply = `db.history.find():\n${JSON.stringify(JSON.parse(history), null, 2)}`;
    } else if (cmd === 'clear') {
      setTerminalOutput([]);
      setCommand('');
      return;
    } else if (cmd === 'mock-error') {
      reply = 'Triggering mock failure...';
      mockBackend.request('GET', '/api/v1/malformed-route-triggering-500-error').catch(() => {});
    } else if (cmd === 'stats') {
      const liveStats = mockBackend.getDbStats();
      reply = `System Telemetry Metrics:
  - Server Uptime   : ${liveStats.uptimeHours} Hours
  - Memory Usage    : ${(24.5 + Math.random() * 2).toFixed(2)} MB / 512 MB
  - Active Sessions : ${liveStats.usersCount} Logged Users
  - Connected Client: Localhost Client WebSocket Live`;
    } else {
      reply = `Command not recognized: "${command}". Type "help" to see legal inputs.`;
    }

    setTerminalOutput((prev) => [...prev, `calcx-shell$ ${command}`, reply]);
    setCommand('');
  };

  return (
    <div className="flex flex-col h-full text-xs font-mono select-none">
      {/* HUD Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#121620] border-b border-cyan-500/20 text-cyan-400">
        <div className="flex items-center gap-2">
          <Terminal size={14} className="animate-pulse" />
          <span className="font-orbitron tracking-wider text-[10px] font-bold">FULL-STACK SERVER CONSOLE (EXPRESS & MONGODB)</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
            PORT: 5000
          </span>
          <span className="text-pink-500 font-bold">LIVE MONGO_URI</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-[#161a27] border-b border-cyan-500/10">
        <button
          onClick={() => setActiveTab('logs')}
          className={`flex-1 py-1.5 text-center transition-colors border-r border-cyan-500/10 cursor-pointer ${
            activeTab === 'logs'
              ? 'bg-[#0f121d] text-cyan-400 border-b-2 border-b-cyan-500 font-semibold'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <div className="flex items-center justify-center gap-1.5">
            <Activity size={12} />
            <span>EXPRESS REST API ROUTER ({logs.length})</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('db')}
          className={`flex-1 py-1.5 text-center transition-colors cursor-pointer ${
            activeTab === 'db'
              ? 'bg-[#0f121d] text-pink-400 border-b-2 border-b-pink-500 font-semibold'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <div className="flex items-center justify-center gap-1.5">
            <Database size={12} />
            <span>MONGODB CLUSTER STATE</span>
          </div>
        </button>
      </div>

      {/* Main Terminal Window Area */}
      <div className="flex-1 bg-[#090b11] p-3 overflow-y-auto h-[180px] min-h-[160px] max-h-[300px]">
        {activeTab === 'logs' ? (
          <div className="space-y-2">
            {terminalOutput.map((logStr, i) => (
              <div
                key={i}
                className={`whitespace-pre-wrap leading-relaxed border-l-2 pl-2 ${
                  logStr.includes('🟢') 
                    ? 'border-emerald-500/50 text-emerald-400' 
                    : logStr.includes('🔴') 
                    ? 'border-rose-500/50 text-rose-400' 
                    : logStr.includes('calcx-shell$')
                    ? 'border-cyan-500/40 text-cyan-400'
                    : 'border-blue-500/30 text-gray-300'
                }`}
              >
                {logStr}
              </div>
            ))}
            <div ref={terminalEndRef} />
          </div>
        ) : (
          <div className="space-y-3 p-1">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#121624] p-2 rounded border border-pink-500/10">
                <div className="text-pink-400 text-[10px] font-orbitron">MONGOOSE COLLECTIONS</div>
                <div className="mt-1 space-y-1">
                  <div className="flex justify-between">
                    <span>users:</span>
                    <span className="text-cyan-400">{stats.usersCount} documents</span>
                  </div>
                  <div className="flex justify-between">
                    <span>history:</span>
                    <span className="text-cyan-400">{stats.recordsCount} documents</span>
                  </div>
                </div>
              </div>
              <div className="bg-[#121624] p-2 rounded border border-pink-500/10">
                <div className="text-pink-400 text-[10px] font-orbitron">CLUSTER STORAGE METRICS</div>
                <div className="mt-1 space-y-1">
                  <div className="flex justify-between">
                    <span>DB Size:</span>
                    <span className="text-pink-300">{stats.databaseSizeKb} KB</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Uptime:</span>
                    <span className="text-emerald-400">{stats.uptimeHours} hrs</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#10131e] p-2 rounded border border-gray-800">
              <div className="flex items-center gap-1.5 text-gray-400 mb-1">
                <ShieldCheck size={12} className="text-emerald-400" />
                <span>JWT Authentication Security Status</span>
              </div>
              <p className="text-[11px] text-gray-400">
                Signups generate simulated HS256 JWT tokens. Request headers carry authorization header <code className="text-amber-400">"Bearer token_payload"</code> and get validated before saving history coordinates.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Command Shell input footer */}
      <form onSubmit={executeCommand} className="flex items-center bg-[#101321] border-t border-cyan-500/20 px-2 py-1.5 gap-2">
        <span className="text-cyan-400 font-bold shrink-0">calcx-shell$</span>
        <input
          type="text"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          placeholder="Type 'help' for terminal commands, e.g., 'show dbs'..."
          className="flex-1 bg-transparent text-gray-100 outline-none placeholder-gray-600 caret-cyan-400 text-xs py-0.5 border-none focus:ring-0"
        />
        <button
          type="submit"
          className="px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[10px] rounded hover:bg-cyan-500/20 hover:border-cyan-500/60 font-orbitron transition-all cursor-pointer"
        >
          EXECUTE
        </button>
      </form>
    </div>
  );
}
