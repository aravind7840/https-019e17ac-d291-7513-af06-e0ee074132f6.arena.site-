import { useState } from 'react';
import { ShieldAlert, Mail, Lock, User, Sparkles, CheckCircle, ShieldCheck } from 'lucide-react';
import { mockBackend, MockUser } from '../utils/mockBackend';

interface AuthModalProps {
  onAuthSuccess: (user: MockUser) => void;
  onClose: () => void;
}

export function AuthModal({ onAuthSuccess, onClose }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (isLogin) {
        // Authenticate User
        const res = await mockBackend.request('POST', '/api/auth/login', {
          email,
          password
        });
        setSuccess('JWT Verification Success! Initializing workspace session...');
        setTimeout(() => {
          onAuthSuccess(res.user);
          onClose();
        }, 1200);
      } else {
        // Register User
        const res = await mockBackend.request('POST', '/api/auth/register', {
          username,
          email,
          password
        });
        setSuccess('Database Collection Inserted! Session JWT generated successfully.');
        setTimeout(() => {
          onAuthSuccess(res.user);
          onClose();
        }, 1200);
      }
    } catch (err: any) {
      setError(err.message || 'Database Transaction Error. Please recheck syntax fields.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#0a0d18] border border-cyan-500/30 rounded-2xl overflow-hidden shadow-2xl relative">
        {/* Laser indicator line */}
        <div className="h-1 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500"></div>

        {/* Modal close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white font-orbitron font-semibold text-sm cursor-pointer"
        >
          ✕
        </button>

        {/* Auth form content */}
        <div className="p-8">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-cyan-500/10 border border-cyan-500/30 rounded-xl flex items-center justify-center text-cyan-400 animate-pulse">
              <ShieldCheck size={24} />
            </div>
          </div>

          <h3 className="text-xl font-bold font-orbitron text-white text-center">
            {isLogin ? 'SECURE LOCKER ACCESS' : 'CREATE CORE ACCOUNT'}
          </h3>
          <p className="text-xs text-gray-400 text-center mt-1">
            {isLogin 
              ? 'Provide credentials to verify session token key' 
              : 'Register account in simulated cluster nodes to enable favorites syncing'}
          </p>

          {error && (
            <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl text-xs flex gap-2 items-center">
              <ShieldAlert size={14} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs flex gap-2 items-center">
              <CheckCircle size={14} className="shrink-0 text-emerald-400" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {!isLogin && (
              <div className="space-y-1.5">
                <label className="block text-[10px] text-gray-400 uppercase font-orbitron tracking-wider">
                  SYSTEM USERNAME
                </label>
                <div className="flex bg-slate-950 border border-white/10 rounded-xl p-2.5 items-center gap-2">
                  <User size={14} className="text-gray-500" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter hacker nickname"
                    className="flex-1 bg-transparent text-xs text-white border-none p-0 focus:ring-0 outline-none"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-[10px] text-gray-400 uppercase font-orbitron tracking-wider">
                EMAIL ADDRESS
              </label>
              <div className="flex bg-slate-950 border border-white/10 rounded-xl p-2.5 items-center gap-2">
                <Mail size={14} className="text-gray-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@calcx.pro"
                  className="flex-1 bg-transparent text-xs text-white border-none p-0 focus:ring-0 outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] text-gray-400 uppercase font-orbitron tracking-wider">
                SECURITY PASSWORD
              </label>
              <div className="flex bg-slate-950 border border-white/10 rounded-xl p-2.5 items-center gap-2">
                <Lock size={14} className="text-gray-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="flex-1 bg-transparent text-xs text-white border-none p-0 focus:ring-0 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-600 hover:brightness-110 text-white rounded-xl text-xs font-orbitron font-semibold tracking-wider transition-all shadow-lg shadow-cyan-500/10 cursor-pointer disabled:opacity-50"
            >
              {loading ? 'PROCESSING CLUSTER NODE...' : isLogin ? 'VERIFY SECURITY TOKEN' : 'GENERATE JWT SECRET'}
            </button>
          </form>

          {/* Toggle Switch */}
          <div className="mt-5 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-[10px] text-purple-400 hover:text-purple-300 font-orbitron tracking-widest font-semibold uppercase cursor-pointer"
            >
              {isLogin ? "DON'T HAVE AN ACCOUNT? REGISTER" : 'ALREADY VERIFIED? LOGIN NOW'}
            </button>
          </div>
        </div>

        {/* Demo instructions footnote */}
        <div className="px-6 py-3.5 bg-slate-950/80 border-t border-white/5 text-[9px] text-gray-500 flex justify-between items-center">
          <span className="flex items-center gap-1">
            <Sparkles size={11} className="text-cyan-400" />
            Simulated sandbox auth keys verified immediately
          </span>
          <span className="text-cyan-400 font-bold font-mono">JWT SECURED</span>
        </div>
      </div>
    </div>
  );
}
