import { useState, useEffect, useRef } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Activity, HelpCircle, Sparkles } from 'lucide-react';
import * as math from 'mathjs';

export function GraphPlotter() {
  const [equation, setEquation] = useState('sin(x) * 2');
  const [zoom, setZoom] = useState(40); // Pixels per unit
  const [offsetX, setOffsetX] = useState(0); // Offset in pixels
  const [offsetY, setOffsetY] = useState(0); // Offset in pixels
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [mouseCoord, setMouseCoord] = useState<{ x: number; y: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const presets = [
    { name: 'Sine Wave', eq: 'sin(x) * 2' },
    { name: 'Cubic Wave', eq: 'x^3 - 3*x' },
    { name: 'Parabola', eq: 'x^2 - 4' },
    { name: 'Cos damped', eq: 'cos(x) * e^(-0.1 * x)' },
    { name: 'Hyperbola', eq: '1 / x' },
  ];

  // Draw coordinate axis and plotted lines on canvas
  const drawGraph = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear Canvas with sleek high-tech slate background
    ctx.fillStyle = '#0b0f19';
    ctx.fillRect(0, 0, width, height);

    const centerX = width / 2 + offsetX;
    const centerY = height / 2 + offsetY;

    // Draw Grid Lines (Neon cyan grid with transparency)
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.08)';
    ctx.lineWidth = 1;

    const step = zoom;
    
    // Grid Lines Vertical
    for (let x = centerX % step; x < width; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    // Grid Lines Horizontal
    for (let y = centerY % step; y < height; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw Main X & Y Axis Lines
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
    ctx.lineWidth = 2;

    // X Axis
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.stroke();

    // Y Axis
    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, height);
    ctx.stroke();

    // Draw Axis Numbers/Ticks
    ctx.fillStyle = 'rgba(6, 182, 212, 0.6)';
    ctx.font = '10px JetBrains Mono';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    // Numbers along X axis
    const startXVal = -Math.floor(centerX / zoom);
    const endXVal = Math.ceil((width - centerX) / zoom);
    for (let i = startXVal; i <= endXVal; i++) {
      if (i === 0) continue;
      const posX = centerX + i * zoom;
      ctx.fillText(i.toString(), posX, centerY + 5);
      ctx.beginPath();
      ctx.moveTo(posX, centerY - 3);
      ctx.lineTo(posX, centerY + 3);
      ctx.stroke();
    }

    // Numbers along Y axis
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    const startYVal = -Math.floor((height - centerY) / zoom);
    const endYVal = Math.ceil(centerY / zoom);
    for (let i = startYVal; i <= endYVal; i++) {
      if (i === 0) continue;
      const posY = centerY - i * zoom;
      ctx.fillText(i.toString(), centerX - 5, posY);
      ctx.beginPath();
      ctx.moveTo(centerX - 3, posY);
      ctx.lineTo(centerX + 3, posY);
      ctx.stroke();
    }

    // Origin text
    ctx.fillText('0', centerX - 5, centerY + 5);

    // Plot mathematical equation line using math.js compiled function
    try {
      const compiled = math.compile(equation);
      setError(null);

      ctx.beginPath();
      ctx.strokeStyle = '#a855f7'; // Neon purple plotted line
      ctx.lineWidth = 3;
      ctx.shadowBlur = 10;
      ctx.shadowColor = 'rgba(168, 85, 247, 0.6)';

      let isFirst = true;

      // Plot step-by-step from left edge to right edge of canvas
      for (let px = 0; px < width; px++) {
        // Convert pixel X coordinate to math value X
        const xVal = (px - centerX) / zoom;
        
        try {
          const yVal = compiled.evaluate({ x: xVal });
          
          if (typeof yVal === 'number' && !isNaN(yVal) && isFinite(yVal)) {
            // Convert math value Y to pixel Y coordinate
            const py = centerY - yVal * zoom;

            // Don't draw points out of bounds or discontinuous jumps
            if (py >= -100 && py <= height + 100) {
              if (isFirst) {
                ctx.moveTo(px, py);
                isFirst = false;
              } else {
                ctx.lineTo(px, py);
              }
            } else {
              isFirst = true;
            }
          } else {
            isFirst = true;
          }
        } catch {
          isFirst = true;
        }
      }
      ctx.stroke();
      ctx.shadowBlur = 0; // Reset shadow effects
    } catch (err: any) {
      setError(err.message || 'Error parsing equation');
    }
  };

  useEffect(() => {
    drawGraph();
  }, [equation, zoom, offsetX, offsetY]);

  // Resize listener
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = canvas.parentElement?.clientWidth || 600;
      canvas.height = 350;
      drawGraph();
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setDragStart({ x, y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    // Calc hover coordinates
    const centerX = canvas.width / 2 + offsetX;
    const centerY = canvas.height / 2 + offsetY;
    const mathX = (px - centerX) / zoom;
    const mathY = (centerY - py) / zoom;
    setMouseCoord({ x: mathX, y: mathY });

    if (!dragStart) return;
    const deltaX = px - dragStart.x;
    const deltaY = py - dragStart.y;
    setOffsetX((prev) => prev + deltaX);
    setOffsetY((prev) => prev + deltaY);
    setDragStart({ x: px, y: py });
  };

  const handleMouseUp = () => {
    setDragStart(null);
  };

  const resetView = () => {
    setOffsetX(0);
    setOffsetY(0);
    setZoom(40);
  };

  return (
    <div className="w-full bg-slate-900/45 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
      {/* Top Banner Header */}
      <div className="px-6 py-4 bg-slate-950/80 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-purple-400 font-orbitron font-semibold uppercase tracking-wider mb-0.5">
            <Activity size={14} className="animate-pulse" />
            VIRTUAL PLOTTING ENGINE v2.0
          </div>
          <h2 className="text-xl font-bold font-orbitron tracking-wide text-white">Interactive Graph Plotter</h2>
        </div>

        {/* Preset equations selector */}
        <div className="flex flex-wrap gap-1.5">
          {presets.map((p, idx) => (
            <button
              key={idx}
              onClick={() => setEquation(p.eq)}
              className={`px-2.5 py-1 text-[10px] rounded border font-mono transition-all cursor-pointer ${
                equation === p.eq
                  ? 'bg-purple-500/10 text-purple-400 border-purple-500/50 glow-purple'
                  : 'bg-slate-950 border-white/5 text-gray-400 hover:text-white hover:border-white/20'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Inputs control bar */}
      <div className="p-4 bg-slate-900/40 border-b border-white/5 grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="md:col-span-3">
          <label className="block text-[10px] text-gray-400 uppercase font-orbitron tracking-wider mb-1.5">
            ENTER MATHEMATICAL EQUATION f(x)
          </label>
          <div className="relative">
            <input
              type="text"
              value={equation}
              onChange={(e) => setEquation(e.target.value)}
              placeholder="e.g. sin(x) * 2, x^2 - 4"
              className="w-full bg-slate-950 border border-white/10 rounded-lg px-4 py-2.5 text-white font-mono text-sm tracking-wide focus:border-purple-500"
            />
            <div className="absolute right-3 top-2.5 flex items-center gap-1">
              <Sparkles size={14} className="text-purple-400 animate-bounce" />
              <span className="text-[10px] text-purple-400 font-bold font-orbitron">PARSED</span>
            </div>
          </div>
          {error && (
            <p className="mt-1 text-xs text-rose-400 font-mono">
              ⚠️ {error}
            </p>
          )}
        </div>

        <div>
          <label className="block text-[10px] text-gray-400 uppercase font-orbitron tracking-wider mb-1.5">
            GRID VIEWPORTS
          </label>
          <div className="flex gap-2 h-[41px]">
            <button
              onClick={() => setZoom((z) => Math.min(150, z + 10))}
              title="Zoom In"
              className="flex-1 bg-slate-950 border border-white/10 hover:border-cyan-500/50 rounded-lg flex items-center justify-center text-cyan-400 hover:bg-cyan-500/5 cursor-pointer"
            >
              <ZoomIn size={16} />
            </button>
            <button
              onClick={() => setZoom((z) => Math.max(10, z - 10))}
              title="Zoom Out"
              className="flex-1 bg-slate-950 border border-white/10 hover:border-cyan-500/50 rounded-lg flex items-center justify-center text-cyan-400 hover:bg-cyan-500/5 cursor-pointer"
            >
              <ZoomOut size={16} />
            </button>
            <button
              onClick={resetView}
              title="Reset View"
              className="flex-1 bg-slate-950 border border-white/10 hover:border-pink-500/50 rounded-lg flex items-center justify-center text-pink-400 hover:bg-pink-500/5 cursor-pointer"
            >
              <RotateCcw size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Canvas Plotting Area */}
      <div className="relative bg-slate-950">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="block w-full cursor-grab active:cursor-grabbing border-b border-white/5"
        />

        {/* Live coordinate tracking hud overlay */}
        {mouseCoord && (
          <div className="absolute bottom-3 left-4 bg-slate-950/90 border border-cyan-500/30 px-3 py-1.5 rounded-lg text-[10px] font-mono text-cyan-400 pointer-events-none tracking-widest flex items-center gap-2 shadow-lg shadow-cyan-500/10 backdrop-blur">
            <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping"></span>
            COORDS: X = {mouseCoord.x.toFixed(3)} | Y = {mouseCoord.y.toFixed(3)}
          </div>
        )}

        <div className="absolute top-3 right-4 text-[9px] font-mono text-gray-500 bg-slate-950/80 px-2.5 py-1 rounded-md border border-white/5 pointer-events-none">
          ℹ️ Drag graph to PAN grid coordinates
        </div>
      </div>

      {/* Foot info */}
      <div className="px-6 py-3 bg-slate-950/50 flex justify-between items-center text-[10px] text-gray-500">
        <span className="flex items-center gap-1">
          <HelpCircle size={12} className="text-purple-400" />
          Supports composite equations like sin(x) + cos(2*x) - x*0.1
        </span>
        <span className="text-purple-400 font-mono uppercase">COORDINATES UNIT: px</span>
      </div>
    </div>
  );
}
