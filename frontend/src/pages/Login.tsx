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
    <div className="font-sans min-h-screen flex items-center justify-center overflow-hidden bg-gray-900">
      <style>
        {`
          .glass-morphism {
              background: rgba(255, 255, 255, 0.05);
              backdrop-filter: blur(16px);
              -webkit-backdrop-filter: blur(16px);
              border: 1px solid rgba(255, 255, 255, 0.1);
          }
          .neon-glow {
              box-shadow: 0 0 15px rgba(59, 130, 246, 0.5);
          }
        `}
      </style>
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 via-transparent to-gray-900/60 z-10"></div>
        <div
          className="w-full h-full bg-cover bg-center"
          style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCGVDmHipRteGYMSi1-PHu3O0A3rcNHr4K25DhIKztrldH_Qj4XAssD8ipA7gW4OQz3svQoDbXC56TmHFWZFmRT4C7gdH1Qw3D5Q6IscuZ6lrBOz5cViK6cPl1qi8Gfzy9CHUcrtahuRmrNLncSeNiRQYi9_hm0U9aUdW4zR3Zh5VMPGR98LINCU1yd4pstRlYucPPUNyxnzvr3L6CRHhuwYXg1IrKV8fP2of1ewxOGZ1h2PAzsfft_NsyU4AX8beAKKQhlckmHccY')" }}
        ></div>
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-blue-500/10 to-transparent pointer-events-none"></div>
      </div>

      <main className="relative z-20 w-full max-w-[24rem] px-4">
        <div className="glass-morphism rounded-2xl p-6 md:p-8 flex flex-col items-center shadow-2xl">
          <div className="flex flex-col items-center mb-6">
            <div className="bg-blue-500/20 p-2.5 rounded-full mb-3 neon-glow">
              <Car className="text-blue-500 w-6 h-6" />
            </div>
            <h1 className="text-white text-2xl font-bold tracking-tight">Fleet MS</h1>
            <div className="h-1 w-12 bg-blue-500 mt-2 rounded-full"></div>
          </div>

          <div className="w-full mb-6 text-center">
            <h2 className="text-white text-xl font-bold mb-1">Welcome back</h2>
            <p className="text-gray-300 text-xs text-balance">Please enter your credentials to access the fleet dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="w-full space-y-4">
            <div className="space-y-1.5">
              <label className="text-gray-200 text-[10px] font-semibold uppercase tracking-wider ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="text-gray-400 w-4 h-4 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="block w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm"
                  placeholder="admin@fleet.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-gray-200 text-[10px] font-semibold uppercase tracking-wider ml-1">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="text-gray-400 w-4 h-4 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  className="block w-full pl-11 pr-11 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between py-1">
              <label className="flex items-center cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input type="checkbox" className="peer sr-only" />
                  <div className="w-4 h-4 rounded-sm border border-blue-500/50 bg-gray-900/50 peer-checked:bg-blue-500 peer-checked:neon-glow flex items-center justify-center transition-all">
                    <svg className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                </div>
                <span className="ml-2 text-xs text-gray-300 group-hover:text-blue-400 transition-colors">Remember me</span>
              </label>
              <a href="#" className="text-xs text-gray-400 hover:text-blue-500 transition-colors">Forgot password?</a>
            </div>

            {error && (
              <div className="p-2.5 bg-red-900/40 border border-red-500/50 rounded-lg">
                <p className="text-xs text-red-400 text-center">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-lg neon-glow transition-all transform active:scale-[0.98] shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
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
          <div className="mt-6 p-4 bg-white/5 border border-white/10 rounded-lg w-full">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2 text-center">
              Demo Access
            </p>
            <div className="space-y-1 text-xs text-gray-400 flex flex-col items-center">
              <p>Admin: <span className="text-white">admin@fleet.com</span> / <span className="text-white">admin123</span></p>
              <p>User: <span className="text-white">john.smith@fleet.com</span> / <span className="text-white">user123</span></p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10 w-full text-center">
            <p className="text-gray-400 text-sm">
              Need access? <a href="#" className="text-blue-500 font-medium hover:underline">Contact Administrator</a>
            </p>
          </div>
        </div>

        <div className="mt-8 flex justify-center space-x-6 text-gray-500 text-xs uppercase tracking-widest font-medium opacity-60">
          <a href="#" className="hover:text-white transition-colors">Privacy</a>
          <a href="#" className="hover:text-white transition-colors">Terms</a>
          <a href="#" className="hover:text-white transition-colors">Support</a>
        </div>
      </main>

      <div className="fixed top-8 right-8 flex gap-3 z-30">
        <div className="glass-morphism px-4 py-2 rounded-full flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-[10px] text-white font-bold uppercase tracking-tighter">System Online</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
