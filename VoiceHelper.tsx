import { useState, useEffect } from 'react';
import { Mic, MicOff, AlertCircle, HelpCircle, Check } from 'lucide-react';

interface VoiceHelperProps {
  onTranscriptResolved: (formula: string) => void;
}

export function VoiceHelper({ onTranscriptResolved }: VoiceHelperProps) {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [processedFormula, setProcessedFormula] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [speechSupported, setSpeechSupported] = useState(true);

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  useEffect(() => {
    if (!SpeechRecognition) {
      setSpeechSupported(false);
    }
  }, []);

  const startListening = () => {
    if (!SpeechRecognition) {
      setError('Web Speech API is not supported by your current browser.');
      return;
    }

    setError(null);
    setTranscript('');
    setProcessedFormula('');

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = 'en-US';
      recognition.interimResults = false;

      recognition.onstart = () => {
        setListening(true);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event);
        setError(`Voice Input Error: ${event.error || 'Check microphone privileges'}`);
        setListening(false);
      };

      recognition.onend = () => {
        setListening(false);
      };

      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
        processSpeechToMath(text);
      };

      recognition.start();
    } catch (e: any) {
      setError(e.message || 'Mic access failed');
      setListening(false);
    }
  };

  const processSpeechToMath = (speechText: string) => {
    let text = speechText.toLowerCase();

    // Mapping dictionary for speech math synonyms
    const synonyms: Record<string, string> = {
      'plus': '+',
      'minus': '-',
      'times': '*',
      'multiplied by': '*',
      'multiply': '*',
      'divide by': '/',
      'divided by': '/',
      'divide': '/',
      'percent': '%',
      'percentage': '%',
      'point': '.',
      'decimal': '.',
      'open bracket': '(',
      'close bracket': ')',
      'sine of': 'sin(',
      'cosine of': 'cos(',
      'tangent of': 'tan(',
      'square root of': 'sqrt(',
      'power of': '^',
      'to the power': '^',
      'equals': '=',
      'equal': '=',
      'pie': 'π',
      'pi': 'π',
    };

    // Parse words and convert
    Object.entries(synonyms).forEach(([word, symbol]) => {
      // Regex boundary replacement to avoid partial words replacing
      const escapedWord = word.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const regex = new RegExp(`\\b${escapedWord}\\b`, 'g');
      text = text.replace(regex, symbol);
    });

    // Strip general alphabetical phrases to avoid invalid syntax evaluates
    let cleanedFormula = text
      .replace(/[^0-9+\-*\/%.()^πeg\s]/g, '')
      .replace(/\s+/g, '');

    // Autocomplete trailing parenthesis if function brackets open but didn't close
    const openCount = (cleanedFormula.match(/\(/g) || []).length;
    const closeCount = (cleanedFormula.match(/\)/g) || []).length;
    if (openCount > closeCount) {
      cleanedFormula += ')'.repeat(openCount - closeCount);
    }

    setProcessedFormula(cleanedFormula || '0');
  };

  const handleApply = () => {
    if (processedFormula) {
      onTranscriptResolved(processedFormula);
    }
  };

  return (
    <div className="w-full bg-[#0a0d18] border border-cyan-500/20 rounded-2xl p-5 relative overflow-hidden">
      {/* Glow visual background */}
      <div className="absolute top-0 left-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-xl pointer-events-none" />

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-ping"></span>
          <span className="text-[10px] text-cyan-400 font-orbitron font-semibold uppercase tracking-wider">
            QUANTUM VOICE ENGINE
          </span>
        </div>

        {!speechSupported && (
          <span className="text-[8px] text-rose-400 border border-rose-500/20 bg-rose-500/10 px-2 py-0.5 rounded font-mono">
            NOT SUPPORTED
          </span>
        )}
      </div>

      <div className="flex flex-col items-center justify-center text-center space-y-4">
        {/* Neon Mic Switch */}
        <button
          onClick={startListening}
          disabled={listening || !speechSupported}
          className={`w-14 h-14 rounded-full flex items-center justify-center border transition-all cursor-pointer ${
            listening
              ? 'bg-rose-500/10 border-rose-500 text-rose-500 animate-pulse glow-rose'
              : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 hover:border-cyan-400 hover:bg-cyan-500/25'
          }`}
        >
          {listening ? <MicOff size={24} className="animate-spin" /> : <Mic size={24} />}
        </button>

        <div>
          <h4 className="text-sm font-bold font-orbitron text-white">
            {listening ? 'LISTENING TO MICROPHONE...' : 'TAP TO COMMENCE COMMAND'}
          </h4>
          <p className="text-xs text-gray-500 mt-1">
            Speak arithmetic (e.g. "5 times 12 plus 9") or trig (e.g. "sine of 45").
          </p>
        </div>

        {/* Audio soundwave equalizer design simulation */}
        {listening && (
          <div className="flex items-center gap-1 h-6">
            {[1, 2, 3, 4, 5, 4, 3, 2, 1, 3, 5, 2, 4].map((h, i) => (
              <div
                key={i}
                style={{ height: `${h * 4}px` }}
                className="w-1 bg-cyan-400 rounded-full animate-[pulse_1.2s_infinite]"
              />
            ))}
          </div>
        )}

        {/* Output blocks */}
        {(transcript || processedFormula) && (
          <div className="w-full space-y-3 pt-3 border-t border-white/5">
            <div className="bg-slate-950 p-3 rounded-xl border border-white/5 text-left space-y-2">
              <div>
                <span className="text-[9px] text-gray-500 font-orbitron tracking-wider">SPEECH RECOGNISED</span>
                <p className="text-xs text-gray-300 font-mono italic">"{transcript}"</p>
              </div>

              {processedFormula && (
                <div>
                  <span className="text-[9px] text-cyan-400 font-orbitron tracking-wider">MATHEMATICAL INTERPRETATION</span>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-sm font-bold text-cyan-400 font-mono select-all bg-cyan-500/5 px-2 py-1 rounded border border-cyan-500/10">
                      {processedFormula}
                    </p>
                    <button
                      onClick={handleApply}
                      className="px-2.5 py-1 bg-cyan-500/10 border border-cyan-500/30 hover:border-cyan-500 text-cyan-400 hover:bg-cyan-500/25 rounded text-[10px] font-orbitron font-semibold flex items-center gap-1 cursor-pointer transition-all"
                    >
                      <Check size={11} />
                      <span>APPLY</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl text-[10px] text-rose-400 font-mono text-left w-full flex gap-2 items-center">
            <AlertCircle size={14} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[9px] text-gray-500">
        <span className="flex items-center gap-1 font-mono">
          <HelpCircle size={11} className="text-cyan-400" />
          Translates terms like "times", "sine of" to *, sin
        </span>
      </div>
    </div>
  );
}
