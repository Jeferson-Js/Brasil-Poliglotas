
import React from 'react';
import { Link } from 'react-router-dom';

export const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 glass-effect border-b border-white/20 py-4 px-6 mb-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-10 h-10 br-gradient rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-emerald-200/50">
            BP
          </div>
          <span className="text-xl font-bold text-slate-800 tracking-tight">
            Brasil<span className="text-emerald-600">Poliglotas</span>
          </span>
        </Link>
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-600">
          <Link to="/dashboard" className="hover:text-emerald-600 transition-colors">Dashboard</Link>
          <Link to="/studio" className="hover:text-emerald-600 transition-colors">AI Studio</Link>
          <Link to="/profile" className="hover:text-emerald-600 transition-colors">Progresso</Link>
        </nav>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
            <span className="text-emerald-600">🔥</span>
            <span className="font-bold text-emerald-800">12</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden border-2 border-white shadow-sm">
            <img src="https://picsum.photos/seed/user/100/100" alt="Profile" />
          </div>
        </div>
      </div>
    </header>
  );
};
