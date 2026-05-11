import { useState, useEffect } from 'react';
import { HelpCircle, Save } from 'lucide-react';
import { mockBackend } from '../utils/mockBackend';

interface BasicCalcProps {
  onCalculationSaved: () => void;
  activeKeyboard: boolean;
  onKeyPressVisual?: (key: string) => void;
}

export function BasicCalc({ onCalculationSaved, activeKeyboard, onKeyPressVisual }: BasicCalcProps) {
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [lastAction, setLastAction] = useState<string | null>(null);

  // Keyboard binding listener
  useEffect(() => {
    if (!activeKeyboard) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key;
      
      if (onKeyPressVisual) {
        onKeyPressVisual(key);
      }

      if (/^[0-9]$/.test(key) || ['+', '-', '*', '/', '.', '%'].includes(key)) {
        e.preventDefault();
        handleInput(key === '*' ? '×' : key === '/' ? '÷' : key);
      } else if (key === 'Enter' || key === '=') {
        e.preventDefault();
        calculate();
      } else if (key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      } else if (key === 'Escape' || key === 'c' || key === 'C') {
        e.preventDefault();
        handleClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [expression, activeKeyboard]);

  const handleInput = (char: string) => {
    setLastAction(char);
    setIsSaved(false);
    
    // Prevent multiple consecutive operators
    const operators = ['+', '-', '×', '÷', '%', '.'];
    const lastChar = expression.slice(-1);
    
    if (operators.includes(char) && operators.includes(lastChar)) {
      setExpression(expression.slice(0, -1) + char);
      return;
    }

    setExpression((prev) => prev + char);
    setTimeout(() => setLastAction(null), 150);
  };

  const handleClear = () => {
    setExpression('');
    setResult('');
    setIsSaved(false);
  };

  const handleBackspace = () => {
    setExpression((prev) => prev.slice(0, -1));
  };

  const calculate = async () => {
    if (!expression) return;
    try {
      // Standardize input for standard evaluate
      let sanitized = expression
        .replace(/×/g, '*')
        .replace(/÷/g, '/');

      // Use basic math evaluation
      // Safe standard arithmetic calculation
      // eslint-disable-next-line no-new-func
      const calcResult = new Function(`return (${sanitized})`)();
      const finalResult = Number.isInteger(calcResult)
        ? calcResult.toString()
        : Number(calcResult.toFixed(8)).toString();

      setResult(finalResult);

      // Call API server (simulated POST to store calculation in MongoDB)
      await mockBackend.request('POST', '/api/calculations', {
        type: 'basic',
        expression: expression,
        result: finalResult,
      });

      onCalculationSaved();
      setIsSaved(true);
    } catch (err) {
      setResult('SYNTAX ERROR');
    }
  };

  const buttons = [
    { label: 'C', value: 'clear', type: 'system', glow: 'text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/50' },
    { label: '⌫', value: 'backspace', type: 'system', glow: 'text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/50' },
    { label: '%', value: '%', type: 'operator', glow: 'text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-500/50' },
    { label: '÷', value: '÷', type: 'operator', glow: 'text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-500/50 animate-pulse' },
    
    { label: '7', value: '7', type: 'number', glow: 'text-gray-200 hover:bg-cyan-500/5 hover:border-cyan-500/30' },
    { label: '8', value: '8', type: 'number', glow: 'text-gray-200 hover:bg-cyan-500/5 hover:border-cyan-500/30' },
    { label: '9', value: '9', type: 'number', glow: 'text-gray-200 hover:bg-cyan-500/5 hover:border-cyan-500/30' },
    { label: '×', value: '×', type: 'operator', glow: 'text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-500/50' },
    
    { label: '4', value: '4', type: 'number', glow: 'text-gray-200 hover:bg-cyan-500/5 hover:border-cyan-500/30' },
    { label: '5', value: '5', type: 'number', glow: 'text-gray-200 hover:bg-cyan-500/5 hover:border-cyan-500/30' },
    { label: '6', value: '6', type: 'number', glow: 'text-gray-200 hover:bg-cyan-500/5 hover:border-cyan-500/30' },
    { label: '-', value: '-', type: 'operator', glow: 'text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-500/50' },
    
    { label: '1', value: '1', type: 'number', glow: 'text-gray-200 hover:bg-cyan-500/5 hover:border-cyan-500/30' },
    { label: '2', value: '2', type: 'number', glow: 'text-gray-200 hover:bg-cyan-500/5 hover:border-cyan-500/30' },
    { label: '3', value: '3', type: 'number', glow: 'text-gray-200 hover:bg-cyan-500/5 hover:border-cyan-500/30' },
    { label: '+', value: '+', type: 'operator', glow: 'text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-500/50' },
    
    { label: '±', value: '±', type: 'operator', glow: 'text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-500/30' },
    { label: '0', value: '0', type: 'number', glow: 'text-gray-200 hover:bg-cyan-500/5 hover:border-cyan-500/30' },
    { label: '.', value: '.', type: 'number', glow: 'text-gray-200 hover:bg-cyan-500/5 hover:border-cyan-500/30' },
    { label: '=', value: '=', type: 'equals', glow: 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:from-cyan-400 hover:to-purple-400 font-bold border-none' },
  ];

  const handleButtonClick = (btn: typeof buttons[0]) => {
    if (btn.value === 'clear') {
      handleClear();
    } else if (btn.value === 'backspace') {
      handleBackspace();
    } else if (btn.value === '=') {
      calculate();
    } else if (btn.value === '±') {
      if (expression.startsWith('-')) {
        setExpression(expression.substring(1));
      } else {
        setExpression('-' + expression);
      }
    } else {
      handleInput(btn.value);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-slate-900/45 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative">
      {/* Laser Top Indicator bar */}
      <div className="h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500"></div>

      {/* Calculator Display Panel */}
      <div className="p-6 bg-slate-950/80 border-b border-white/5 text-right relative">
        <div className="absolute top-2 left-3 flex items-center gap-1 text-[10px] text-cyan-400/60 uppercase font-orbitron tracking-wider">
          <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping"></span>
          BASIC ENGINE ACTIVE
        </div>

        {isSaved && (
          <div className="absolute top-2 right-3 flex items-center gap-1 text-[10px] text-emerald-400 font-orbitron tracking-widest bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-500/20">
            <Save size={10} />
            MONGO-DB SYNCED
          </div>
        )}

        <div className="h-8 text-cyan-300/80 font-mono text-lg overflow-x-auto whitespace-nowrap scrollbar-none pt-2">
          {expression || '0'}
        </div>
        <div className="h-14 font-orbitron text-4xl text-white font-semibold tracking-tight pt-1 overflow-x-auto whitespace-nowrap scrollbar-none">
          {result || '0'}
        </div>
      </div>

      {/* Button Keypad Grid */}
      <div className="p-6 grid grid-cols-4 gap-3 bg-slate-900/65">
        {buttons.map((btn, idx) => (
          <button
            key={idx}
            onClick={() => handleButtonClick(btn)}
            className={`h-14 rounded-xl border border-white/5 flex items-center justify-center font-orbitron text-lg transition-all duration-150 relative overflow-hidden cursor-pointer select-none ${btn.glow} ${
              lastAction === btn.value ? 'scale-95 bg-white/10 border-cyan-400 glow-cyan' : ''
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Interactive Helper Indicator info */}
      <div className="px-6 py-3 bg-slate-950/50 flex justify-between items-center text-[10px] text-gray-500 border-t border-white/5">
        <span className="flex items-center gap-1">
          <HelpCircle size={12} className="text-cyan-400" />
          Supports physical Numpad keys & Enter
        </span>
        <span className="text-purple-400 font-mono uppercase">calcx-proc: #01</span>
      </div>
    </div>
  );
}
