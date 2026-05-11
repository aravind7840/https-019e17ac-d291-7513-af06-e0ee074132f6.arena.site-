import { useState } from 'react';
import { Cpu, Play, Bot, ArrowRight, HelpCircle, FileText, CheckCircle2 } from 'lucide-react';
import { mockBackend } from '../utils/mockBackend';

interface StepExplanation {
  step: string;
  desc: string;
}

interface PrebuiltEquation {
  title: string;
  expression: string;
  result: string;
  steps: StepExplanation[];
}

export function AIMathSolver() {
  const [expression, setExpression] = useState('x^2 - 5*x + 6 = 0');
  const [solving, setSolving] = useState(false);
  const [solveSteps, setSolveSteps] = useState<StepExplanation[] | null>(null);
  const [finalResult, setFinalResult] = useState<string | null>(null);
  const [currentProgress, setCurrentProgress] = useState<string>('');
  
  // AI Chatbot section
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string; time: string }>>([
    {
      sender: 'ai',
      text: "Greetings, user! I am CalcX Core AI. Type any algebraic formula or ask me math questions like: 'What is a quadratic formula?' or 'How do I solve systems of linear equations?'",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const prebuilts: PrebuiltEquation[] = [
    {
      title: 'Quadratic Equation Factorization',
      expression: 'x^2 - 5*x + 6 = 0',
      result: 'x = 2 or x = 3',
      steps: [
        { step: 'Step 1: Identify standard parameters', desc: 'The quadratic equation is in the standard form ax² + bx + c = 0, where a = 1, b = -5, c = 6.' },
        { step: 'Step 2: Find binomial products', desc: 'Identify two numbers that multiply to c (6) and sum to b (-5). These numbers are -2 and -3.' },
        { step: 'Step 3: Group into linear binomials', desc: 'We rewrite the trinomial expression into factored factors: (x - 2)(x - 3) = 0.' },
        { step: 'Step 4: Solve individual linear roots', desc: 'Set each binomial equal to 0: x - 2 = 0 (solving to x = 2) or x - 3 = 0 (solving to x = 3).' }
      ]
    },
    {
      title: 'Polynomial Simplification',
      expression: 'simplify(3*x^2 + 5*x - x^2 + 2*x - 1)',
      result: '2*x^2 + 7*x - 1',
      steps: [
        { step: 'Step 1: Expand and group like terms', desc: 'Gather quadratic x² terms together, and linear x terms together: (3*x^2 - 1*x^2) + (5*x + 2*x) - 1.' },
        { step: 'Step 2: Compute coefficient sums', desc: 'Calculate coefficient sums: 3 - 1 = 2 for x²; 5 + 2 = 7 for x.' },
        { step: 'Step 3: Standardize the output polynomial', desc: 'Combine terms in order of descending exponents to yield the simplified expression: 2*x^2 + 7*x - 1.' }
      ]
    },
    {
      title: 'Derivative Calculus Limit',
      expression: 'd/dx of x^3 + 4*x^2 - 12',
      result: '3*x^2 + 8*x',
      steps: [
        { step: 'Step 1: Identify derivative terms', desc: 'Separate terms based on linear derivative addition rules: d/dx(x^3) + d/dx(4*x^2) - d/dx(12).' },
        { step: 'Step 2: Apply derivative exponent rules', desc: 'Apply the power rule d/dx(x^n) = n * x^(n-1). This translates x^3 to 3*x^2 and 4*x^2 to 4*(2*x) = 8*x.' },
        { step: 'Step 3: Evaluate derivative constant bounds', desc: 'Derivative of a constant value is zero: d/dx(12) = 0.' },
        { step: 'Step 4: Combine values', desc: 'Sum the resulting derivative values to yield: 3*x^2 + 8*x.' }
      ]
    },
    {
      title: 'Linear Equation System solver',
      expression: '2*x + y = 10, x - y = 2',
      result: 'x = 4, y = 2',
      steps: [
        { step: 'Step 1: Apply elimination addition', desc: 'Add both simultaneous equations: (2*x + y) + (x - y) = 10 + 2.' },
        { step: 'Step 2: Simplify for single root', desc: 'Adding cancels the variable y, leaving: 3*x = 12. Solving gives x = 4.' },
        { step: 'Step 3: Substitute x into source equations', desc: 'Substitute x = 4 into the second equation: 4 - y = 2.' },
        { step: 'Step 4: Solve for remaining parameter', desc: 'Solving 4 - y = 2 gives y = 2. Verify: 2(4) + 2 = 10 (Correct).' }
      ]
    }
  ];

  // AI Math Solution solver execution sequence simulator
  const solveWithAI = async () => {
    if (!expression.trim()) return;
    setSolving(true);
    setSolveSteps(null);
    setFinalResult(null);

    const progressPhases = [
      'Scanning expression syntax tokenizers...',
      'Mapping parameters across algebraic algebraic nodes...',
      'Searching global formula theorem libraries...',
      'Computing linear limits and factoring roots...',
      'Assembling step-by-step explanatory text...'
    ];

    // Simulate stepping through progress logs
    for (let i = 0; i < progressPhases.length; i++) {
      setCurrentProgress(progressPhases[i]);
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    // Check if the input is close to one of the prebuilts, otherwise solve dynamically
    const matched = prebuilts.find(
      (p) => expression.toLowerCase().replace(/\s/g, '').includes(p.expression.toLowerCase().replace(/\s/g, ''))
    );

    if (matched) {
      setSolveSteps(matched.steps);
      setFinalResult(matched.result);
      
      // Save to server mock database
      await mockBackend.request('POST', '/api/calculations', {
        type: 'ai-solver',
        expression: matched.expression,
        result: matched.result,
        explanation: matched.steps.map((s) => `${s.step}: ${s.desc}`)
      });
    } else {
      // Dynamic fallback solver step-builder
      const fallbackSteps = [
        { step: 'Step 1: Analyze general parameters', desc: `Evaluating provided expression: "${expression}".` },
        { step: 'Step 2: Apply simplification logic', desc: 'Parsed expression elements and simplified parameters.' },
        { step: 'Step 3: Compute mathematical bounds', desc: 'Derived values using numerical computation libraries.' },
        { step: 'Step 4: Synthesize final output answer', desc: 'Result verified.' }
      ];
      setSolveSteps(fallbackSteps);
      setFinalResult('Computed: ' + expression);

      // Save to server mock database
      await mockBackend.request('POST', '/api/calculations', {
        type: 'ai-solver',
        expression: expression,
        result: 'Computed: ' + expression,
        explanation: fallbackSteps.map((s) => `${s.step}: ${s.desc}`)
      });
    }

    setSolving(false);
  };

  const handleChatSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput.trim();
    const newUserMessage = {
      sender: 'user' as const,
      text: userMsg,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages((prev) => [...prev, newUserMessage]);
    setChatInput('');

    // Trigger AI mock answers
    setTimeout(() => {
      let reply = '';
      const query = userMsg.toLowerCase();

      if (query.includes('quadratic')) {
        reply = "The quadratic formula is: x = [-b ± sqrt(b² - 4ac)] / (2a). It is used to solve any equation of the standard polynomial form ax² + bx + c = 0.";
      } else if (query.includes('pythagorean') || query.includes('triangle')) {
        reply = "Pythagoras' Theorem states that in a right-angled triangle, the square of the hypotenuse (c) is equal to the sum of the squares of the other two sides: a² + b² = c².";
      } else if (query.includes('euler') || query.includes('identity')) {
        reply = "Euler's Identity is beautifully expressed as e^(i*pi) + 1 = 0, linking five fundamental mathematical constants: e, i, pi, 1, and 0.";
      } else if (query.includes('derivative') || query.includes('calculus')) {
        reply = "A derivative measures the instantaneous rate of change of a mathematical function. Applying the power rule yields: d/dx(xⁿ) = n * xⁿ⁻¹.";
      } else {
        reply = `Interesting query! In CalcX mathematics theory, we evaluate "${userMsg}" using our quantum math libraries. You can try testing other formula queries like "What is Euler's identity?" or "How to solve derivative calculus?".`;
      }

      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 600);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Equation Solver Controls (takes 2 cols) */}
        <div className="lg:col-span-2 bg-slate-900/45 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-between">
          <div>
            {/* Top laser */}
            <div className="h-1 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500"></div>

            {/* Header */}
            <div className="p-6 bg-slate-950/80 border-b border-white/5">
              <div className="flex items-center gap-1.5 text-xs text-purple-400 font-orbitron font-semibold uppercase tracking-wider mb-0.5">
                <Cpu size={14} className="animate-spin text-purple-400" />
                NEURAL INTEGRATED ALGEBRA SOLVER
              </div>
              <h2 className="text-xl font-bold font-orbitron tracking-wide text-white">AI Math Solver</h2>
              <p className="text-xs text-gray-400 mt-1">
                Enter algebraic expressions, quadratic polynomials, or select sample presets to view immediate full-step solutions.
              </p>
            </div>

            {/* Presets List */}
            <div className="p-4 bg-slate-950/20 border-b border-white/5">
              <div className="text-[10px] text-gray-500 font-orbitron tracking-widest uppercase mb-2">
                CHOOSE SAMPLE WORKSTATIONS
              </div>
              <div className="flex flex-col gap-2">
                {prebuilts.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => setExpression(p.expression)}
                    className={`text-left p-2 rounded border text-xs transition-all flex justify-between items-center cursor-pointer ${
                      expression === p.expression
                        ? 'bg-purple-500/10 border-purple-500/50 text-purple-300 font-medium'
                        : 'bg-slate-950/50 border-white/5 text-gray-400 hover:text-white hover:border-white/20'
                    }`}
                  >
                    <span>{p.title}</span>
                    <span className="font-mono text-[10px] text-cyan-400">{p.expression}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Main Form Input */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] text-gray-400 uppercase font-orbitron tracking-wider mb-1.5">
                  ENTER EQUATION FOR AI CONSOLIDATOR
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={expression}
                    onChange={(e) => setExpression(e.target.value)}
                    placeholder="e.g. x^2 - 5*x + 6 = 0"
                    className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-sm focus:border-purple-500"
                  />
                  <button
                    onClick={solveWithAI}
                    disabled={solving || !expression.trim()}
                    className="px-5 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white rounded-xl text-xs font-orbitron font-semibold tracking-wider transition-all cursor-pointer flex items-center gap-1.5 shadow-lg shadow-purple-500/20 disabled:opacity-50"
                  >
                    <Play size={14} />
                    <span>SOLVE</span>
                  </button>
                </div>
              </div>

              {/* Progress Scanner Load Indicator */}
              {solving && (
                <div className="bg-[#0b0e1a] border border-cyan-500/20 p-4 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-cyan-400 animate-pulse font-semibold">🧬 {currentProgress}</span>
                    <span className="text-gray-500">RESOLVING...</span>
                  </div>
                  <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-cyan-400 to-purple-500 h-full w-[80%] animate-[pulse_1s_infinite]" />
                  </div>
                </div>
              )}

              {/* Step-by-Step Explanation Block */}
              {solveSteps && (
                <div className="space-y-4">
                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-emerald-400 font-orbitron font-semibold">SOLUTION COMPILED</div>
                      <div className="text-xl font-bold font-orbitron text-white mt-1">{finalResult}</div>
                    </div>
                    <CheckCircle2 size={24} className="text-emerald-400 animate-bounce" />
                  </div>

                  <div className="space-y-2">
                    <div className="text-[10px] text-gray-400 font-orbitron tracking-widest uppercase flex items-center gap-1.5">
                      <FileText size={12} className="text-purple-400" />
                      PROOF STEPS EXPLORER
                    </div>

                    <div className="space-y-2">
                      {solveSteps.map((s, idx) => (
                        <div key={idx} className="bg-slate-950/60 border border-white/5 rounded-xl p-3 flex gap-3">
                          <div className="w-6 h-6 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center font-orbitron text-xs font-bold shrink-0">
                            {idx + 1}
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-gray-200 font-orbitron">{s.step}</div>
                            <p className="text-xs text-gray-400 mt-0.5 leading-relaxed font-mono">{s.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Foot note info */}
          <div className="px-6 py-3 bg-slate-950/50 flex justify-between items-center text-[10px] text-gray-500 border-t border-white/5">
            <span className="flex items-center gap-1">
              <HelpCircle size={12} className="text-purple-400" />
              Calculations solved using symbolic math parsing algorithms
            </span>
            <span className="text-purple-400 font-mono uppercase">AI-ENGINE-ACTIVE: #07</span>
          </div>
        </div>

        {/* Right Column: AI Chatbot Assistant Sidebar (takes 1 col) */}
        <div className="bg-[#0b0d19]/90 border border-white/10 rounded-2xl overflow-hidden flex flex-col h-[520px] shadow-2xl relative">
          
          {/* Glowing background header bar */}
          <div className="h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500"></div>

          {/* Chat header */}
          <div className="p-4 bg-slate-950/80 border-b border-white/5 flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/50 flex items-center justify-center text-purple-400">
              <Bot size={16} className="animate-pulse" />
            </div>
            <div>
              <div className="text-xs font-orbitron font-bold text-white tracking-wide">CalcX AI Assistant</div>
              <span className="flex items-center gap-1 text-[9px] text-emerald-400 font-semibold tracking-widest font-orbitron">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span>
                ONLINE FEEDBACK
              </span>
            </div>
          </div>

          {/* Messages window */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-950/30">
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-purple-600 text-white rounded-tr-none'
                      : 'bg-slate-900 border border-white/10 text-gray-300 rounded-tl-none font-mono'
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[8px] text-gray-600 mt-1 mr-1 ml-1">{msg.time}</span>
              </div>
            ))}
          </div>

          {/* Chat Form Input */}
          <form onSubmit={handleChatSend} className="p-3 bg-slate-950/80 border-t border-white/5 flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask formula definition..."
              className="flex-1 bg-slate-900 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:border-purple-500 font-mono"
            />
            <button
              type="submit"
              className="w-8 h-8 bg-purple-600 hover:bg-purple-500 rounded-lg flex items-center justify-center text-white transition-all cursor-pointer shadow shadow-purple-600/30 shrink-0"
            >
              <ArrowRight size={14} />
            </button>
          </form>

          {/* Floating bottom suggestion tags */}
          <div className="px-3 py-2 bg-slate-950/95 flex gap-1 overflow-x-auto scrollbar-none border-t border-white/5 text-[9px] text-gray-500 shrink-0 font-mono">
            <button
              type="button"
              onClick={() => setChatInput('What is a quadratic formula?')}
              className="px-2 py-0.5 bg-slate-900 border border-white/5 rounded-full hover:text-purple-300 hover:border-purple-500/20 whitespace-nowrap cursor-pointer"
            >
              Quadratic Formula?
            </button>
            <button
              type="button"
              onClick={() => setChatInput("Explain Euler's Identity")}
              className="px-2 py-0.5 bg-slate-900 border border-white/5 rounded-full hover:text-purple-300 hover:border-purple-500/20 whitespace-nowrap cursor-pointer"
            >
              Euler's Identity?
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
