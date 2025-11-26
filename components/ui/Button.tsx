
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'fomo' | 'shimmer' | 'super-cta';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({ variant = 'primary', size = 'md', children, className = '', ...props }) => {
  const baseStyles = "inline-flex items-center justify-center gap-2 rounded-full font-bold transition-all duration-300 transform active:translate-y-0 cursor-pointer relative overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-none";
  
  const sizeStyles = {
    sm: "px-4 py-2 text-xs",
    md: "px-[20px] py-[10px] text-sm",
    lg: "px-8 py-4 text-base sm:text-lg shadow-lg",
  };

  const variants = {
    primary: "bg-green-dark text-white border border-green-dark shadow-glow hover:bg-[#005f2e] hover:shadow-[0_14px_30px_rgba(0,90,43,0.45)] hover:-translate-y-[2px]",
    outline: "bg-white text-green-dark border-2 border-green-dark/20 hover:border-green-dark hover:bg-green-50 hover:shadow-md hover:-translate-y-[1px]",
    fomo: "bg-[#0b1b2b] text-white border-none shadow-md hover:bg-black hover:shadow-lg px-[18px] py-[8px]",
    shimmer: "bg-gradient-primary text-white border-none shadow-glow animate-pulse-glow hover:animate-none hover:scale-105",
    // New High-Contrast CTA recommended by AI
    'super-cta': "bg-[#FF6600] text-white border-none shadow-[0_8px_20px_rgba(255,102,0,0.4)] hover:shadow-[0_12px_25px_rgba(255,102,0,0.5)] hover:bg-[#e65c00] hover:scale-105 animate-shake border-b-4 border-[#cc5200] active:border-b-0 active:translate-y-1",
  };

  const shimmerOverlay = (variant === 'shimmer' && !props.disabled) ? (
    <div className="absolute inset-0 -translate-x-full animate-shimmer bg-shimmer-gradient" />
  ) : null;

  return (
    <button className={`${baseStyles} ${sizeStyles[size]} ${variants[variant]} ${className}`} {...props}>
      <span className="relative z-10 flex items-center gap-2">{children}</span>
      {shimmerOverlay}
    </button>
  );
};

export default Button;
