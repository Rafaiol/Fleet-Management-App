import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, Eye, EyeOff, Loader2, Mail, Lock } from 'lucide-react';
import { useAuth } from '@/hooks';

const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading, error, clearError } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
    return () => {
      clearError();
    };
  }, [isAuthenticated, navigate, clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) return;

    try {
      await login(formData.email, formData.password).unwrap();
      navigate('/');
    } catch (err) {
      // Error is handled by the auth slice
    }
  };

  return (
    <div className="font-sans min-h-screen flex items-center justify-center overflow-hidden bg-white dark:bg-slate-950 relative selection:bg-indigo-500/30">

      {/* Animated Aurora Background Blobs */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Pastel Indigo Blob */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] opacity-40 animate-blob bg-indigo-300 dark:bg-indigo-900/50" style={{ animation: "auroraFloat1 20s infinite alternate ease-in-out" }}></div>
        {/* Light Violet Blob */}
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[120px] opacity-40 animate-blob bg-violet-300 dark:bg-violet-900/50" style={{ animation: "auroraFloat2 25s infinite alternate-reverse ease-in-out" }}></div>
        {/* Subtle Cyan Accent */}
        <div className="absolute top-[40%] left-[60%] w-[400px] h-[400px] rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[90px] opacity-30 animate-blob bg-cyan-200 dark:bg-cyan-900/40" style={{ animation: "auroraFloat3 22s infinite alternate ease-in-out" }}></div>
      </div>

      <main className="relative z-20 w-full max-w-[28rem] px-4 mt-16 sm:mt-5">
        {/* The card-aurora class handles the subtle glowing border and glass backdrop */}
        <div className="card-aurora p-8 flex flex-col items-center backdrop-blur-2xl bg-white/60 dark:bg-slate-900/80 shadow-2xl">

          {/* Logo Section */}
          <div className="flex flex-col items-center mb-6">
            <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 mb-4 group hover:shadow-md transition-shadow">
              <Car className="text-indigo-600 dark:text-indigo-400 w-8 h-8 transform group-hover:scale-110 transition-transform duration-300" />
            </div>
            <h1 className="text-slate-900 dark:text-white text-2xl font-bold tracking-tight mb-2">Welcome Back</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm text-center px-4">
              Sign in to your account to access the fleet dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} className="w-full space-y-4">

            {/* Email Input */}
            <div className="space-y-1.5">
              <label className="text-slate-700 dark:text-slate-300 text-xs font-semibold uppercase tracking-wider ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="text-slate-400 dark:text-slate-500 w-4 h-4 group-focus-within:text-indigo-500 transition-colors" />
                </div>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="block w-full pl-10 pr-4 py-2.5 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-700/60 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all text-sm backdrop-blur-sm"
                  placeholder="admin@fleet.com"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="text-slate-700 dark:text-slate-300 text-xs font-semibold uppercase tracking-wider ml-1">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="text-slate-400 dark:text-slate-500 w-4 h-4 group-focus-within:text-indigo-500 transition-colors" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  className="block w-full pl-10 pr-10 py-2.5 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-700/60 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all text-sm backdrop-blur-sm"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Options Row */}
            <div className="flex items-center justify-between py-2">
              <label className="flex items-center cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input type="checkbox" className="peer sr-only" />
                  <div className="w-4 h-4 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 peer-checked:bg-indigo-600 peer-checked:border-indigo-600 flex items-center justify-center transition-all shadow-sm">
                    <svg className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                </div>
                <span className="ml-2.5 text-xs text-slate-600 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors font-medium">Remember me</span>
              </label>
              <a href="#" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors">Forgot password?</a>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 rounded-xl flex items-start gap-2 animate-in fade-in zoom-in-95 duration-200">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                <p className="text-xs text-red-600 dark:text-red-400 font-medium leading-relaxed">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-all transform active:scale-[0.98] shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/40 disabled:opacity-70 disabled:cursor-not-allowed text-sm mt-4"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Authenticating...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-8 p-4 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 rounded-xl w-full">
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 text-center">
              Demo Access
            </p>
            <div className="space-y-2 text-xs text-slate-500 dark:text-slate-400 flex flex-col items-center">
              <p>Admin: <span className="font-semibold text-slate-700 dark:text-slate-200 bg-white/50 dark:bg-slate-900/50 px-1.5 py-0.5 rounded">admin@fleet.com</span> / <span className="font-semibold text-slate-700 dark:text-slate-200">admin123</span></p>
              <p>User: <span className="font-semibold text-slate-700 dark:text-slate-200 bg-white/50 dark:bg-slate-900/50 px-1.5 py-0.5 rounded">john.smith@fleet.com</span> / <span className="font-semibold text-slate-700 dark:text-slate-200">user123</span></p>
            </div>
          </div>

          <div className="mt-8 text-center w-full">
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Don't have an account? <a href="#" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">Contact Administrator</a>
            </p>
          </div>
        </div>

        <div className="mt-8 flex justify-center space-x-6 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-widest font-semibold opacity-80">
          <a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Privacy</a>
          <a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Terms</a>
          <a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Support</a>
        </div>
      </main>

      <div className="fixed top-6 right-6 flex gap-3 z-30">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-full border border-slate-200/50 dark:border-slate-700/50 shadow-sm flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]"></span>
          <span className="text-[10px] text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider">System Online</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
