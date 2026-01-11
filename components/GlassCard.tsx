
import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = "" }) => {
  return (
    <div className={`glass-effect rounded-2xl shadow-sm transition-all duration-300 ${className}`}>
      {children}
    </div>
  );
};
