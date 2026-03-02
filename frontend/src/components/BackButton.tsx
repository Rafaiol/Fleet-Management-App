import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  to?: string;
  onClick?: () => void;
  label?: string;
  className?: string;
}

const BackButton: React.FC<BackButtonProps> = ({ to, onClick, label = 'Back', className = '' }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`relative group flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm transition-all duration-300 transform active:scale-95 ${className}`}
    >
      {/* Glassmorphic Background */}
      <div className="absolute inset-0 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md rounded-full shadow-sm group-hover:shadow-md transition-shadow"></div>

      {/* Aurora Gradient Border (Idle & Hover) */}
      <div className="absolute inset-0 rounded-full p-[1px] bg-gradient-to-r from-transparent via-transparent to-transparent group-hover:from-cyan-400 group-hover:via-indigo-500 group-hover:to-violet-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)", WebkitMaskComposite: "xor", maskComposite: "exclude" }}></div>

      {/* Default Subtle Border */}
      <div className="absolute inset-0 rounded-full border border-slate-200/50 dark:border-slate-700/50 group-hover:border-transparent transition-colors duration-300"></div>

      {/* Button Content */}
      <ArrowLeft className="relative z-10 w-4 h-4 text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
      <span className="relative z-10 text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{label}</span>

      {/* Subtle Aurora Glow on Hover */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400/0 via-indigo-500/0 to-violet-500/0 group-hover:from-cyan-400/10 group-hover:via-indigo-500/10 group-hover:to-violet-500/10 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
    </button>
  );
};

export default BackButton;
