import { useState, useEffect } from 'react';
import { Search, Trash2, Star, Download, Sparkles, Filter, Database, CheckCircle2, RefreshCw } from 'lucide-react';
import { mockBackend, CalculationRecord } from '../utils/mockBackend';

interface HistoryPanelProps {
  refreshTrigger: number;
  onDbAction: () => void;
}

export function HistoryPanel({ refreshTrigger, onDbAction }: HistoryPanelProps) {
  const [history, setHistory] = useState<CalculationRecord[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'basic' | 'scientific' | 'unit' | 'currency' | 'ai-solver'>('all');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [loading, setLoading] = useState(false);
  const [exported, setExported] = useState(false);

  // Load history from mock backend
  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await mockBackend.request('GET', '/api/calculations');
      setHistory(data);
    } catch (e) {
      console.error('Error fetching history:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [refreshTrigger]);

  const toggleFavorite = async (id: string) => {
    try {
      await mockBackend.request('PUT', `/api/calculations/${id}`);
      fetchHistory();
      onDbAction();
    } catch (e) {
      console.error(e);
    }
  };

  const deleteRecord = async (id: string) => {
    try {
      await mockBackend.request('DELETE', `/api/calculations/${id}`);
      fetchHistory();
      onDbAction();
    } catch (e) {
      console.error(e);
    }
  };

  const clearAllHistory = async () => {
    if (!window.confirm('Are you sure you want to permanently clear your calculation history from MongoDB?')) return;
    try {
      await mockBackend.request('DELETE', '/api/calculations/clear-all');
      fetchHistory();
      onDbAction();
    } catch (e) {
      console.error(e);
    }
  };

  // Filter lists based on inputs
  const filteredHistory = history.filter((item) => {
    const matchesSearch = item.expression.toLowerCase().includes(search.toLowerCase()) || 
                          item.result.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.type === categoryFilter;
    const matchesFavorite = !favoritesOnly || item.isFavorite;

    return matchesSearch && matchesCategory && matchesFavorite;
  });

  // Handle export PDF report action simulation
  const handleExport = () => {
    setExported(true);
    setTimeout(() => {
      setExported(false);
      
      // Open a clean print window with a high-tech style report
      const printWindow = window.open('', '_blank');
      if (!printWindow) return;

      const itemsHtml = filteredHistory.map((item, idx) => `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 12px; font-weight: bold; color: #1e293b;">#${idx + 1}</td>
          <td style="padding: 12px; font-family: monospace; color: #475569;">${item.type.toUpperCase()}</td>
          <td style="padding: 12px; font-family: monospace; color: #0f172a; font-weight: 500;">${item.expression}</td>
          <td style="padding: 12px; font-family: 'Courier New', Courier, monospace; color: #2563eb; font-weight: bold;">${item.result}</td>
          <td style="padding: 12px; color: #64748b; font-size: 11px;">${new Date(item.createdAt).toLocaleString()}</td>
        </tr>
      `).join('');

      printWindow.document.write(`
        <html>
          <head>
            <title>CalcX Pro — Compiled Mathematical Report</title>
            <style>
              body { font-family: 'Helvetica Neue', Arial, sans-serif; margin: 40px; color: #1e293b; background-color: #fafafa; }
              .header { text-align: center; border-bottom: 3px solid #6366f1; padding-bottom: 20px; margin-bottom: 30px; }
              .header h1 { font-size: 28px; margin: 0; color: #312e81; font-family: sans-serif; }
              .header p { font-size: 14px; margin: 5px 0 0; color: #64748b; }
              .meta-grid { display: grid; grid-template-cols: 1fr 1fr; gap: 20px; margin-bottom: 30px; background: #fff; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; }
              .meta-item { font-size: 13px; color: #475569; }
              .meta-item strong { color: #0f172a; }
              table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0; }
              th { background-color: #6366f1; color: white; padding: 12px; text-align: left; font-size: 13px; font-weight: 600; }
              .footer { text-align: center; margin-top: 40px; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>CalcX Pro Analytics Platform</h1>
              <p>Certified High-Precision Mathematical Computation Report</p>
            </div>
            <div class="meta-grid">
              <div class="meta-item"><strong>Generated On:</strong> ${new Date().toLocaleString()}</div>
              <div class="meta-item"><strong>Report ID:</strong> CX-REP-${Math.floor(100000 + Math.random() * 900000)}</div>
              <div class="meta-item"><strong>Total Records:</strong> ${filteredHistory.length} items</div>
              <div class="meta-item"><strong>Status:</strong> MONGODB VERIFIED CLUSTER</div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Index</th>
                  <th>Category</th>
                  <th>Mathematical Expression</th>
                  <th>Resolved Result</th>
                  <th>Execution Timestamp</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml || '<tr><td colspan="5" style="text-align: center; padding: 20px; color: #94a3b8;">No mathematical records matching current filter rules.</td></tr>'}
              </tbody>
            </table>
            <div class="footer">
              <p>CalcX Pro © 2026 Scientific Analytics System. This document contains verifiable cryptographically compiled math formulas.</p>
            </div>
            <script>
              window.onload = function() {
                window.print();
              }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }, 1200);
  };

  return (
    <div className="w-full bg-slate-900/45 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
      {/* Top Laser Border */}
      <div className="h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500"></div>

      {/* Header Info */}
      <div className="p-6 bg-slate-950/80 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-pink-400 font-orbitron font-semibold uppercase tracking-wider mb-0.5">
            <Database size={14} className="animate-pulse" />
            MONGODB PERSISTENT COLLECTIONS
          </div>
          <h2 className="text-xl font-bold font-orbitron tracking-wide text-white">Calculation Database Logs</h2>
          <p className="text-xs text-gray-400 mt-1">
            Browse, search, favorite, or export report summaries of all math records recorded in your secure MongoDB cluster database.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-center">
          <button
            onClick={fetchHistory}
            className="p-2 rounded-lg bg-slate-900 border border-white/10 text-cyan-400 hover:text-white hover:border-cyan-500 transition-all cursor-pointer"
            title="Refresh database"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={clearAllHistory}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 hover:border-rose-500 text-xs font-semibold font-orbitron cursor-pointer transition-all"
          >
            <Trash2 size={12} />
            <span>CLEAR MONGODB</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar controls */}
      <div className="p-4 bg-slate-900/40 border-b border-white/5 grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Search Input */}
        <div className="md:col-span-2 relative">
          <Search size={14} className="absolute left-3 top-3 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search equations or result values..."
            className="w-full bg-slate-950 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-xs text-white focus:border-cyan-500 font-mono"
          />
        </div>

        {/* Category select filter */}
        <div className="flex items-center bg-slate-950 border border-white/10 rounded-lg px-2.5">
          <Filter size={12} className="text-gray-500 mr-2 shrink-0" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as any)}
            className="w-full bg-transparent text-xs text-gray-200 outline-none border-none py-1.5 font-orbitron uppercase cursor-pointer"
          >
            <option value="all" className="bg-slate-900 text-white">ALL CATEGORIES</option>
            <option value="basic" className="bg-slate-900 text-white">BASIC</option>
            <option value="scientific" className="bg-slate-900 text-white">SCIENTIFIC</option>
            <option value="unit" className="bg-slate-900 text-white">UNIT</option>
            <option value="currency" className="bg-slate-900 text-white">CURRENCY</option>
            <option value="ai-solver" className="bg-slate-900 text-white">AI MATH SOLVER</option>
          </select>
        </div>

        {/* Favorites Switcher toggle */}
        <button
          onClick={() => setFavoritesOnly((prev) => !prev)}
          className={`px-3 py-2 rounded-lg border font-orbitron text-xs transition-all cursor-pointer flex items-center justify-center gap-2 ${
            favoritesOnly
              ? 'bg-amber-500/10 border-amber-500/50 text-amber-400 font-semibold shadow shadow-amber-500/15'
              : 'bg-slate-950 border-white/10 text-gray-400 hover:text-white'
          }`}
        >
          <Star size={12} className={favoritesOnly ? 'fill-amber-400 text-amber-400' : ''} />
          <span>FAVORITES {favoritesOnly ? 'ONLY' : 'ALL'}</span>
        </button>
      </div>

      {/* Main Database Table/Card List */}
      <div className="p-4 bg-slate-950/25 max-h-[350px] overflow-y-auto space-y-2">
        {loading ? (
          <div className="py-12 flex flex-col items-center gap-2 text-gray-500">
            <RefreshCw size={24} className="animate-spin text-pink-500" />
            <span className="text-xs font-orbitron">Querying secure cloud database tables...</span>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="py-12 flex flex-col items-center gap-2 text-gray-500 border border-dashed border-white/5 rounded-xl">
            <Database size={24} className="text-gray-600 animate-pulse" />
            <span className="text-xs font-orbitron">No records matching query rules found</span>
          </div>
        ) : (
          filteredHistory.map((item) => (
            <div
              key={item._id}
              className="p-3 bg-slate-900/60 border border-white/5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-white/15 transition-all"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`text-[8px] px-2 py-0.5 rounded-full font-bold font-orbitron tracking-wider ${
                    item.type === 'basic' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' :
                    item.type === 'scientific' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                    item.type === 'unit' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                    item.type === 'currency' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                    'bg-pink-500/10 text-pink-400 border border-pink-500/20'
                  }`}>
                    {item.type.toUpperCase()}
                  </span>
                  <span className="text-[10px] text-gray-600 font-mono">
                    {new Date(item.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                
                <div className="text-xs font-semibold text-gray-300 font-mono select-all">
                  {item.expression}
                </div>
                <div className="text-sm font-bold text-white font-orbitron select-all flex items-center gap-1">
                  <span>=</span>
                  <span className="text-cyan-300">{item.result}</span>
                </div>

                {item.explanation && item.explanation.length > 0 && (
                  <details className="mt-1">
                    <summary className="text-[9px] text-purple-400 font-orbitron hover:text-purple-300 cursor-pointer outline-none">
                      VIEW AI EXPLANATION
                    </summary>
                    <div className="mt-1 bg-slate-950/65 rounded border border-white/5 p-2 space-y-1 text-[9px] text-gray-400 font-mono leading-relaxed">
                      {item.explanation.map((exp, stepIdx) => (
                        <div key={stepIdx} className="border-b border-white/5 pb-1 last:border-none">
                          {exp}
                        </div>
                      ))}
                    </div>
                  </details>
                )}
              </div>

              {/* Action Buttons (Fav/Trash) */}
              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  onClick={() => toggleFavorite(item._id)}
                  className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
                    item.isFavorite
                      ? 'bg-amber-500/10 border-amber-500/50 text-amber-400 hover:bg-amber-500/20'
                      : 'bg-slate-950 border-white/10 text-gray-500 hover:text-white hover:border-white/25'
                  }`}
                  title={item.isFavorite ? 'Remove from favorites' : 'Mark as favorite'}
                >
                  <Star size={13} className={item.isFavorite ? 'fill-amber-400' : ''} />
                </button>
                <button
                  onClick={() => deleteRecord(item._id)}
                  className="w-8 h-8 rounded-lg bg-slate-950 border border-white/10 text-rose-500 hover:bg-rose-500/10 hover:border-rose-500/50 flex items-center justify-center transition-all cursor-pointer"
                  title="Delete from database"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Compile Document Export PDF simulator */}
      <div className="px-6 py-4 bg-slate-950/50 flex flex-col sm:flex-row justify-between items-center gap-3">
        <span className="flex items-center gap-1.5 text-[10px] text-gray-500">
          <Sparkles size={12} className="text-pink-400 animate-bounce shrink-0" />
          Filter results above and export to beautifully styled PDF/Print formats
        </span>
        <button
          onClick={handleExport}
          disabled={exported || filteredHistory.length === 0}
          className="w-full sm:w-auto px-4.5 py-2.5 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-500 text-white font-bold font-orbitron text-xs rounded-xl hover:brightness-110 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-40"
        >
          {exported ? (
            <>
              <CheckCircle2 size={14} className="animate-bounce" />
              <span>EXPORTING SYSTEM REPORT...</span>
            </>
          ) : (
            <>
              <Download size={14} />
              <span>COMPILE ANALYTICS REPORT</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
