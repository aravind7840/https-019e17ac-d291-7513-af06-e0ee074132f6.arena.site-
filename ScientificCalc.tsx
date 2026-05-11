import { useState, useEffect } from 'react';
import { HelpCircle, Globe } from 'lucide-react';
import * as math from 'mathjs';
import { mockBackend } from '../utils/mockBackend';

interface ScientificCalcProps {
  onCalculationSaved: () => void;
  activeKeyboard: boolean;
  onKeyPressVisual?: (key: string) => void;
}

export function ScientificCalc({ onCalculationSaved, activeKeyboard, onKeyPressVisual }: ScientificCalcProps) {
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState('');
  const [isRad, setIsRad] = useState(true);
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

      if (/^[0-9]$/.test(key) || ['+', '-', '*', '/', '.', '(', ')', '^'].includes(key)) {
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
  }, [expression, activeKeyboard, isRad]);

  const handleInput = (value: string) => {
    setLastAction(value);
    setIsSaved(false);
    setExpression((prev) => prev + value);
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
      // 1. Prepare expression for Math.js parsing
      let mathExpr = expression
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/π/g, 'pi')
        .replace(/e/g, '2.718281828459');

      // 2. Trigonometry pre-conversion for degrees if toggled
      if (!isRad) {
        // Substitute sin(val) with sin(val * deg) to convert degree input to radians
        mathExpr = mathExpr
          .replace(/sin\(([^)]+)\)/g, 'sin(($1) deg)')
          .replace(/cos\(([^)]+)\)/g, 'cos(($1) deg)')
          .replace(/tan\(([^)]+)\)/g, 'tan(($1) deg)');
      }

      // 3. Evaluate using math.js library
      const parsedVal = math.evaluate(mathExpr);
      
      let finalResult = '';
      if (typeof parsedVal === 'number') {
        finalResult = Number.isInteger(parsedVal)
          ? parsedVal.toString()
          : Number(parsedVal.toFixed(8)).toString();
      } else {
        finalResult = parsedVal.toString();
      }

      setResult(finalResult);

      // Save to mock DB
      await mockBackend.request('POST', '/api/calculations', {
        type: 'scientific',
        expression: expression,
        result: finalResult,
      });

      onCalculationSaved();
      setIsSaved(true);
    } catch (err: any) {
      console.error(err);
      setResult('SYNTAX ERROR');
    }
  };

  const buttons = [
    // Sci Functions row 1
    { label: 'sin', value: 'sin(', type: 'func', glow: 'text-purple-400 border-purple-500/20 hover:bg-purple-500/10' },
    { label: 'cos', value: 'cos(', type: 'func', glow: 'text-purple-400 border-purple-500/20 hover:bg-purple-500/10' },
    { label: 'tan', value: 'tan(', type: 'func', glow: 'text-purple-400 border-purple-500/20 hover:bg-purple-500/10' },
    { label: 'π', value: 'π', type: 'constant', glow: 'text-purple-400 border-purple-500/20 hover:bg-purple-500/10' },
    
    // Sci Functions row 2
    { label: 'log', value: 'log10(', type: 'func', glow: 'text-purple-400 border-purple-500/20 hover:bg-purple-500/10' },
    { label: 'ln', value: 'log(', type: 'func', glow: 'text-purple-400 border-purple-500/20 hover:bg-purple-500/10' },
    { label: '√', value: 'sqrt(', type: 'func', glow: 'text-purple-400 border-purple-500/20 hover:bg-purple-500/10' },
    { label: 'e', value: 'e', type: 'constant', glow: 'text-purple-400 border-purple-500/20 hover:bg-purple-500/10' },
    
    // Sci Functions row 3
    { label: 'x^y', value: '^', type: 'func', glow: 'text-purple-400 border-purple-500/20 hover:bg-purple-500/10' },
    { label: 'x!', value: '!', type: 'func', glow: 'text-purple-400 border-purple-500/20 hover:bg-purple-500/10' },
    { label: '(', value: '(', type: 'parenthesis', glow: 'text-pink-400 border-pink-500/20 hover:bg-pink-500/10' },
    { label: ')', value: ')', type: 'parenthesis', glow: 'text-pink-400 border-pink-500/20 hover:bg-pink-500/10' },

    // Standard pad row 4
    { label: 'C', value: 'clear', type: 'system', glow: 'text-rose-400 border-rose-500/20 hover:bg-rose-500/10 font-bold' },
    { label: '⌫', value: 'backspace', type: 'system', glow: 'text-amber-400 border-amber-500/20 hover:bg-amber-500/10' },
    { label: '%', value: '%', type: 'operator', glow: 'text-cyan-400 border-cyan-500/20 hover:bg-cyan-500/10' },
    { label: '÷', value: '÷', type: 'operator', glow: 'text-cyan-400 border-cyan-500/20 hover:bg-cyan-500/10' },

    // Row 5
    { label: '7', value: '7', type: 'number', glow: 'text-gray-200 border-white/5 hover:bg-white/5' },
    { label: '8', value: '8', type: 'number', glow: 'text-gray-200 border-white/5 hover:bg-white/5' },
    { label: '9', value: '9', type: 'number', glow: 'text-gray-200 border-white/5 hover:bg-white/5' },
    { label: '×', value: '×', type: 'operator', glow: 'text-cyan-400 border-cyan-500/20 hover:bg-cyan-500/10' },

    // Row 6
    { label: '4', value: '4', type: 'number', glow: 'text-gray-200 border-white/5 hover:bg-white/5' },
    { label: '5', value: '5', type: 'number', glow: 'text-gray-200 border-white/5 hover:bg-white/5' },
    { label: '6', value: '6', type: 'number', glow: 'text-gray-200 border-white/5 hover:bg-white/5' },
    { label: '-', value: '-', type: 'operator', glow: 'text-cyan-400 border-cyan-500/20 hover:bg-cyan-500/10' },

    // Row 7
    { label: '1', value: '1', type: 'number', glow: 'text-gray-200 border-white/5 hover:bg-white/5' },
    { label: '2', value: '2', type: 'number', glow: 'text-gray-200 border-white/5 hover:bg-white/5' },
    { label: '3', value: '3', type: 'number', glow: 'text-gray-200 border-white/5 hover:bg-white/5' },
    { label: '+', value: '+', type: 'operator', glow: 'text-cyan-400 border-cyan-500/20 hover:bg-cyan-500/10' },

    // Row 8
    { label: 'RAD/DEG', value: 'rad_deg', type: 'system', glow: 'text-pink-400 border-pink-500/20 hover:bg-pink-500/10 font-orbitron text-[9px]' },
    { label: '0', value: '0', type: 'number', glow: 'text-gray-200 border-white/5 hover:bg-white/5' },
    { label: '.', value: '.', type: 'number', glow: 'text-gray-200 border-white/5 hover:bg-white/5' },
    { label: '=', value: '=', type: 'equals', glow: 'bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-500 text-white font-bold border-none shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 hover:brightness-110' },
  ];

  const handleButtonClick = (btn: typeof buttons[0]) => {
    if (btn.value === 'clear') {
      handleClear();
    } else if (btn.value === 'backspace') {
      handleBackspace();
    } else if (btn.value === 'rad_deg') {
      setIsRad((prev) => !prev);
    } else if (btn.value === '=') {
      calculate();
    } else {
      handleInput(btn.value);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-slate-900/45 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative">
      {/* Laser Top Indicator bar */}
      <div className="h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500"></div>

      {/* Calculator Display Panel */}
      <div className="p-6 bg-slate-950/80 border-b border-white/5 text-right relative">
        <div className="absolute top-2 left-3 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-ping"></span>
          <span className="text-[10px] text-purple-400/80 uppercase font-orbitron tracking-wider">
            SCIENTIFIC CORES ONLINE
          </span>
          <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold font-orbitron ${
            isRad ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'bg-pink-500/10 text-pink-400 border border-pink-500/20'
          }`}>
            {isRad ? 'RADIAN' : 'DEGREE'}
          </span>
        </div>

        {isSaved && (
          <div className="absolute top-2 right-3 flex items-center gap-1 text-[10px] text-emerald-400 font-orbitron tracking-widest bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-500/20">
            <Globe size={10} className="animate-spin text-emerald-400" />
            MONGO CLUSTER OK
          </div>
        )}

        <div className="h-8 text-purple-300/80 font-mono text-base overflow-x-auto whitespace-nowrap scrollbar-none pt-2">
          {expression || '0'}
        </div>
        <div className="h-14 font-orbitron text-4xl text-white font-semibold tracking-tight pt-1 overflow-x-auto whitespace-nowrap scrollbar-none">
          {result || '0'}
        </div>
      </div>

      {/* Button Keypad Grid (4 cols, 8 rows of sci buttons) */}
      <div className="p-5 grid grid-cols-4 gap-2 bg-slate-900/65">
        {buttons.map((btn, idx) => (
          <button
            key={idx}
            onClick={() => handleButtonClick(btn)}
            className={`h-11 rounded-lg border flex items-center justify-center font-orbitron text-sm transition-all duration-150 relative overflow-hidden cursor-pointer select-none ${btn.glow} ${
              lastAction === btn.value ? 'scale-95 bg-white/10 border-purple-400 glow-purple' : ''
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Interactive Helper Indicator info */}
      <div className="px-6 py-2.5 bg-slate-950/50 flex justify-between items-center text-[10px] text-gray-500 border-t border-white/5">
        <span className="flex items-center gap-1">
          <HelpCircle size={12} className="text-purple-400" />
          Functions like sin, cos, tan require brackets, e.g., sin(pi/2)
        </span>
        <span className="text-cyan-400 font-mono uppercase">calcx-proc: #02</span>
      </div>
    </div>
  );
}
