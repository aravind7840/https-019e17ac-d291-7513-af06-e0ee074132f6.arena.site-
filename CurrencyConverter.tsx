import { useState, useEffect } from 'react';
import { Landmark, TrendingUp, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';
import { mockBackend } from '../utils/mockBackend';

type CurrencyCode = 'USD' | 'INR' | 'EUR' | 'GBP' | 'JPY';

interface CurrencyInfo {
  code: CurrencyCode;
  symbol: string;
  name: string;
  baseRateToUsd: number; // rate to 1 USD
  flag: string;
}

export function CurrencyConverter() {
  const [amount, setAmount] = useState('100');
  const [fromCode, setFromCode] = useState<CurrencyCode>('USD');
  const [toCode, setToCode] = useState<CurrencyCode>('INR');
  const [converted, setConverted] = useState('8300');
  const [updating, setUpdating] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('');
  const [trendValues, setTrendValues] = useState<number[]>([]);

  const currencies: Record<CurrencyCode, CurrencyInfo> = {
    USD: { code: 'USD', symbol: '$', name: 'US Dollar', baseRateToUsd: 1, flag: '🇺🇸' },
    INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee', baseRateToUsd: 83.24, flag: '🇮🇳' },
    EUR: { code: 'EUR', symbol: '€', name: 'Euro', baseRateToUsd: 0.92, flag: '🇪🇺' },
    GBP: { code: 'GBP', symbol: '£', name: 'British Pound', baseRateToUsd: 0.79, flag: '🇬🇧' },
    JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', baseRateToUsd: 154.50, flag: '🇯🇵' },
  };

  // Convert amount
  const convert = () => {
    const num = parseFloat(amount);
    if (isNaN(num)) {
      setConverted('0.00');
      return;
    }

    const fromRate = currencies[fromCode].baseRateToUsd;
    const toRate = currencies[toCode].baseRateToUsd;

    // Convert from source to USD first, then to destination
    const inUsd = num / fromRate;
    const finalAmount = inUsd * toRate;

    setConverted(finalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
  };

  // Simulate updating rates with small market noise
  const fetchLatestRates = () => {
    setUpdating(true);
    setTimeout(() => {
      setUpdating(false);
      setLastUpdated(new Date().toLocaleTimeString());
      convert();
      generateMockTrends();
    }, 800);
  };

  // Generate mock historic 7 day conversion rate points
  const generateMockTrends = () => {
    const fromRate = currencies[fromCode].baseRateToUsd;
    const toRate = currencies[toCode].baseRateToUsd;
    const directRate = toRate / fromRate;

    const data: number[] = [];
    for (let i = 0; i < 7; i++) {
      // Add random small market fluctuate (-2% to +2%)
      const noise = 1 + (Math.random() * 0.04 - 0.02);
      data.push(directRate * noise);
    }
    setTrendValues(data);
  };

  useEffect(() => {
    convert();
    generateMockTrends();
  }, [amount, fromCode, toCode]);

  useEffect(() => {
    setLastUpdated(new Date().toLocaleTimeString());
  }, []);

  const handleSwap = () => {
    const temp = fromCode;
    setFromCode(toCode);
    setToCode(temp);
  };

  const storeTransaction = async () => {
    const displayExpr = `${currencies[fromCode].symbol}${amount} (${fromCode}) to ${currencies[toCode].symbol} (${toCode})`;
    try {
      await mockBackend.request('POST', '/api/calculations', {
        type: 'currency',
        expression: displayExpr,
        result: `${currencies[toCode].symbol}${converted} (${toCode})`,
      });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-slate-900/45 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
      {/* Top Header laser */}
      <div className="h-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-500"></div>

      {/* Hero Header */}
      <div className="p-6 bg-slate-950/80 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-amber-400 font-orbitron font-semibold uppercase tracking-wider mb-0.5">
            <Landmark size={14} className="animate-spin text-amber-400" />
            LIVE MARKET DATA FEED
          </div>
          <h2 className="text-xl font-bold font-orbitron tracking-wide text-white">Forex Currency Converter</h2>
        </div>
        <button
          onClick={fetchLatestRates}
          disabled={updating}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-xs text-cyan-400 hover:text-white hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw size={12} className={updating ? 'animate-spin' : ''} />
          {updating ? 'FETCHING RATES...' : 'SYNC EXCHANGE RATES'}
        </button>
      </div>

      {/* Grid Inputs panel */}
      <div className="p-6 bg-slate-900/45 border-b border-white/5 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-center">
          
          {/* FROM Code selector */}
          <div className="md:col-span-3 space-y-1.5">
            <label className="block text-[10px] text-gray-400 uppercase font-orbitron tracking-wider">
              FROM CURRENCY
            </label>
            <div className="flex bg-slate-950 border border-white/10 rounded-xl p-3 items-center gap-2">
              <span className="text-2xl">{currencies[fromCode].flag}</span>
              <select
                value={fromCode}
                onChange={(e) => setFromCode(e.target.value as CurrencyCode)}
                className="flex-1 bg-transparent text-white font-orbitron font-semibold text-sm outline-none border-none py-1 cursor-pointer"
              >
                {Object.values(currencies).map((c) => (
                  <option key={c.code} value={c.code} className="bg-slate-900 text-white font-mono">
                    {c.code} - {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* SWAP Keypad */}
          <div className="md:col-span-1 flex justify-center pt-3">
            <button
              onClick={handleSwap}
              className="w-10 h-10 rounded-full bg-slate-950 border border-white/10 flex items-center justify-center text-cyan-400 hover:text-white hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all cursor-pointer"
            >
              ⇄
            </button>
          </div>

          {/* TO Code selector */}
          <div className="md:col-span-3 space-y-1.5">
            <label className="block text-[10px] text-gray-400 uppercase font-orbitron tracking-wider">
              TO CURRENCY
            </label>
            <div className="flex bg-slate-950 border border-white/10 rounded-xl p-3 items-center gap-2">
              <span className="text-2xl">{currencies[toCode].flag}</span>
              <select
                value={toCode}
                onChange={(e) => setToCode(e.target.value as CurrencyCode)}
                className="flex-1 bg-transparent text-white font-orbitron font-semibold text-sm outline-none border-none py-1 cursor-pointer"
              >
                {Object.values(currencies).map((c) => (
                  <option key={c.code} value={c.code} className="bg-slate-900 text-white font-mono">
                    {c.code} - {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

        </div>

        {/* Magnitude Amount + Converted Panel */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-950/70 p-4 rounded-xl border border-white/5">
            <label className="block text-[10px] text-gray-500 font-orbitron tracking-widest mb-1">
              ENTER AMOUNT
            </label>
            <div className="flex items-center gap-2">
              <span className="text-xl font-orbitron font-bold text-gray-400">
                {currencies[fromCode].symbol}
              </span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-transparent text-white font-orbitron text-2xl font-bold outline-none border-none p-0 focus:ring-0"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="bg-slate-950/70 p-4 rounded-xl border border-white/5 flex flex-col justify-center">
            <label className="block text-[10px] text-gray-500 font-orbitron tracking-widest mb-1">
              ESTIMATED EXCHANGE VALUE
            </label>
            <div className="text-emerald-400 font-orbitron text-2xl font-bold tracking-tight">
              {currencies[toCode].symbol} {converted}
            </div>
          </div>
        </div>

        {/* 7-Day Market Trend Mini Graph */}
        <div className="bg-slate-950/65 rounded-xl border border-white/5 p-4 relative overflow-hidden">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-1.5 text-[10px] text-cyan-400 font-orbitron uppercase">
              <TrendingUp size={12} />
              7-Day Exchange Trend (Direct Rate)
            </div>
            <span className="text-[10px] text-gray-500 font-mono">
              1 {fromCode} = {(currencies[toCode].baseRateToUsd / currencies[fromCode].baseRateToUsd).toFixed(4)} {toCode}
            </span>
          </div>

          <div className="flex items-end gap-1 h-12 pt-2 px-2">
            {trendValues.map((val, idx) => {
              const max = Math.max(...trendValues);
              const min = Math.min(...trendValues);
              const range = max - min || 1;
              const percent = ((val - min) / range) * 80 + 20; // Scale from 20% to 100% height

              return (
                <div key={idx} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-1 bg-[#101424] border border-cyan-500/30 text-[9px] px-1 py-0.5 rounded text-cyan-300 font-mono opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none whitespace-nowrap">
                    {val.toFixed(4)}
                  </div>
                  <div
                    style={{ height: `${percent}%` }}
                    className="w-full bg-gradient-to-t from-cyan-500/20 to-cyan-400 rounded-sm hover:brightness-125 transition-all cursor-pointer"
                  />
                  <span className="text-[8px] text-gray-600 mt-1 font-mono">D{idx + 1}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Converter save action footer log */}
      <div className="px-6 py-4 bg-slate-950/50 flex flex-col sm:flex-row justify-between items-center gap-3">
        <span className="flex items-center gap-1 text-[10px] text-gray-500">
          <AlertCircle size={12} className="text-amber-500 shrink-0" />
          Forex rates fluctuate; mock data matches simulated index rates. Updated at: {lastUpdated}
        </span>
        <button
          onClick={storeTransaction}
          className="w-full sm:w-auto px-4 py-2 bg-amber-500/10 border border-amber-500/30 hover:border-amber-500 text-amber-400 rounded-lg text-xs font-orbitron font-semibold tracking-wider hover:bg-amber-500/20 cursor-pointer flex items-center justify-center gap-2 transition-all"
        >
          <Sparkles size={12} className="text-amber-400 animate-pulse" />
          <span>STORE RECORD</span>
        </button>
      </div>
    </div>
  );
}
