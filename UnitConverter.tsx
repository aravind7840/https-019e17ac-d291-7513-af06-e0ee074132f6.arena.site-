import { useState, useEffect } from 'react';
import { Ruler, Scale, Thermometer, Gauge, Square, ChevronRight, HelpCircle } from 'lucide-react';
import { mockBackend } from '../utils/mockBackend';

type UnitCategory = 'length' | 'weight' | 'temperature' | 'speed' | 'area';

interface ConversionRule {
  [key: string]: {
    name: string;
    factor: number | ((val: number, reverse?: boolean) => number);
  };
}

export function UnitConverter() {
  const [category, setCategory] = useState<UnitCategory>('length');
  const [fromValue, setFromValue] = useState('100');
  const [fromUnit, setFromUnit] = useState('m');
  const [toUnit, setToUnit] = useState('ft');
  const [result, setResult] = useState('328.08');

  // Multi-unit rules collection
  const unitRules: Record<UnitCategory, ConversionRule> = {
    length: {
      m: { name: 'Meters (m)', factor: 1 },
      km: { name: 'Kilometers (km)', factor: 1000 },
      ft: { name: 'Feet (ft)', factor: 0.3048 },
      in: { name: 'Inches (in)', factor: 0.0254 },
      mi: { name: 'Miles (mi)', factor: 1609.34 },
    },
    weight: {
      kg: { name: 'Kilograms (kg)', factor: 1 },
      g: { name: 'Grams (g)', factor: 0.001 },
      lbs: { name: 'Pounds (lbs)', factor: 0.453592 },
      oz: { name: 'Ounces (oz)', factor: 0.0283495 },
    },
    temperature: {
      C: { name: 'Celsius (°C)', factor: (val, rev) => rev ? val : val },
      F: { 
        name: 'Fahrenheit (°F)', 
        factor: (val, rev) => rev ? (val * 9/5) + 32 : (val - 32) * 5/9 
      },
      K: { 
        name: 'Kelvin (K)', 
        factor: (val, rev) => rev ? val + 273.15 : val - 273.15 
      }
    },
    speed: {
      'm/s': { name: 'Meters per sec (m/s)', factor: 1 },
      'km/h': { name: 'Kilometers per hr (km/h)', factor: 0.277778 },
      mph: { name: 'Miles per hour (mph)', factor: 0.44704 },
      knots: { name: 'Knots', factor: 0.514444 },
    },
    area: {
      'm2': { name: 'Square meters (m²)', factor: 1 },
      'ft2': { name: 'Square feet (ft²)', factor: 0.092903 },
      acres: { name: 'Acres', factor: 4046.86 },
      hectares: { name: 'Hectares', factor: 10000 },
    },
  };

  // Convert whenever parameters update
  useEffect(() => {
    const val = parseFloat(fromValue);
    if (isNaN(val)) {
      setResult('0');
      return;
    }

    const rules = unitRules[category];
    const fromRule = rules[fromUnit];
    const toRule = rules[toUnit];

    if (!fromRule || !toRule) return;

    let baseVal = 0;

    // Convert from input unit to standard reference unit
    if (typeof fromRule.factor === 'function') {
      baseVal = fromRule.factor(val, false);
    } else {
      baseVal = val * fromRule.factor;
    }

    // Convert standard reference unit to output unit
    let finalVal = 0;
    if (typeof toRule.factor === 'function') {
      finalVal = toRule.factor(baseVal, true);
    } else {
      finalVal = baseVal / toRule.factor;
    }

    const roundedVal = Number(finalVal.toFixed(4)).toString();
    setResult(roundedVal);
  }, [category, fromValue, fromUnit, toUnit]);

  // Handle category shift, reset default select units
  const handleCategoryChange = (cat: UnitCategory) => {
    setCategory(cat);
    const availableUnits = Object.keys(unitRules[cat]);
    setFromUnit(availableUnits[0]);
    setToUnit(availableUnits[1] || availableUnits[0]);
  };

  // Dispatch details logs to server
  const saveConversionToHistory = async () => {
    const fromName = unitRules[category][fromUnit].name;
    const toName = unitRules[category][toUnit].name;
    try {
      await mockBackend.request('POST', '/api/calculations', {
        type: 'unit',
        expression: `${fromValue} ${fromName} to ${toName}`,
        result: `${result} ${toName}`,
      });
    } catch (e) {
      console.error('Error saving unit conversion:', e);
    }
  };

  const categories = [
    { id: 'length', name: 'Length', icon: Ruler, color: 'text-cyan-400 border-cyan-500/20 bg-cyan-500/5' },
    { id: 'weight', name: 'Weight', icon: Scale, color: 'text-purple-400 border-purple-500/20 bg-purple-500/5' },
    { id: 'temperature', name: 'Temperature', icon: Thermometer, color: 'text-pink-400 border-pink-500/20 bg-pink-500/5' },
    { id: 'speed', name: 'Speed', icon: Gauge, color: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5' },
    { id: 'area', name: 'Area', icon: Square, color: 'text-amber-400 border-amber-500/20 bg-amber-500/5' },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto bg-slate-900/45 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
      {/* Top Header line */}
      <div className="h-1 bg-gradient-to-r from-emerald-500 via-cyan-500 to-indigo-500"></div>

      {/* Hero Header panel */}
      <div className="p-6 bg-slate-950/80 border-b border-white/5">
        <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-orbitron font-semibold uppercase tracking-wider mb-0.5">
          <ChevronRight size={14} className="animate-pulse" />
          QUANTUM DIMENSION METRICS
        </div>
        <h2 className="text-xl font-bold font-orbitron tracking-wide text-white">Advanced Unit Converter</h2>
      </div>

      {/* Select Category Grid */}
      <div className="p-5 grid grid-cols-2 sm:grid-cols-5 gap-2 bg-slate-950/20">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = category === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id as UnitCategory)}
              className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                isActive
                  ? 'border-emerald-500/60 bg-emerald-500/10 text-emerald-400 shadow-lg shadow-emerald-500/10 scale-105'
                  : 'border-white/5 text-gray-400 hover:text-white hover:border-white/20 hover:bg-white/5'
              }`}
            >
              <Icon size={20} />
              <span className="text-xs font-orbitron font-medium tracking-wide">
                {cat.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Interaction Conversion panel */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-900/45 border-b border-white/5">
        {/* FROM Card */}
        <div className="bg-slate-950/70 p-5 rounded-2xl border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-xl pointer-events-none" />
          
          <label className="block text-[10px] text-gray-500 uppercase font-orbitron tracking-wider mb-2">
            SOURCE MAGNITUDE
          </label>
          <input
            type="number"
            value={fromValue}
            onChange={(e) => setFromValue(e.target.value)}
            className="w-full bg-transparent text-white font-orbitron text-2xl tracking-tight mb-4 border-none p-0 focus:ring-0 outline-none select-none"
            placeholder="0.0"
          />

          <label className="block text-[10px] text-gray-500 uppercase font-orbitron tracking-wider mb-1">
            SOURCE UNIT
          </label>
          <select
            value={fromUnit}
            onChange={(e) => setFromUnit(e.target.value)}
            className="w-full bg-slate-900 border border-white/10 rounded-lg p-2.5 text-xs text-gray-200 outline-none focus:border-emerald-500 font-mono"
          >
            {Object.entries(unitRules[category]).map(([key, item]) => (
              <option key={key} value={key}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        {/* TO Card */}
        <div className="bg-slate-950/70 p-5 rounded-2xl border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl pointer-events-none" />

          <label className="block text-[10px] text-gray-500 uppercase font-orbitron tracking-wider mb-2">
            CONVERTED EQUIVALENT
          </label>
          <div className="w-full bg-transparent text-emerald-400 font-orbitron text-2xl tracking-tight mb-4 select-all font-semibold h-8 overflow-hidden text-ellipsis">
            {result}
          </div>

          <label className="block text-[10px] text-gray-500 uppercase font-orbitron tracking-wider mb-1">
            DESTINATION UNIT
          </label>
          <select
            value={toUnit}
            onChange={(e) => setToUnit(e.target.value)}
            className="w-full bg-slate-900 border border-white/10 rounded-lg p-2.5 text-xs text-gray-200 outline-none focus:border-emerald-500 font-mono"
          >
            {Object.entries(unitRules[category]).map(([key, item]) => (
              <option key={key} value={key}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Converter save action footer log */}
      <div className="px-6 py-4 bg-slate-950/50 flex flex-col sm:flex-row justify-between items-center gap-3">
        <span className="flex items-center gap-1 text-[10px] text-gray-500">
          <HelpCircle size={12} className="text-emerald-400" />
          Converted mathematically inside browser using core standard factors
        </span>
        <button
          onClick={saveConversionToHistory}
          className="w-full sm:w-auto px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 hover:border-emerald-500 text-emerald-400 rounded-lg text-xs font-orbitron font-semibold tracking-wider hover:bg-emerald-500/20 cursor-pointer flex items-center justify-center gap-2 transition-all"
        >
          <span>STORE IN MONGODB</span>
        </button>
      </div>
    </div>
  );
}
