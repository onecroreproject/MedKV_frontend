import React from 'react';

/**
 * Reusable Card primitive for radiology academy sections, previews, and feature tiles.
 */
export function Card({
  children,
  className = '',
  hoverEffect = true,
  glow = false,
  variant = 'default', // 'default', 'dark', 'light', 'glass'
  ...props
}) {
  const baseClasses = 'rounded-xl overflow-hidden transition-all duration-500 ease-out border';
  
  const variants = {
    default: 'bg-white border-slate-100 text-charcoal shadow-sm',
    light: 'bg-soft-gray border-slate-200 text-charcoal shadow-sm',
    dark: 'bg-white border-slate-200/60 text-charcoal shadow-md',
    glass: 'bg-white/85 backdrop-blur-md border-slate-200/80 text-charcoal shadow-xl'
  };

  const hoverClasses = hoverEffect 
    ? 'hover:shadow-[0_12px_30px_0_rgba(11,31,77,0.06)] hover:-translate-y-1 hover:border-accent/50' 
    : '';

  const glowClasses = glow 
    ? 'shadow-[0_0_20px_0_rgba(200,155,60,0.1)] border-accent/20' 
    : '';

  return (
    <div
      className={`${baseClasses} ${variants[variant]} ${hoverClasses} ${glowClasses} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '', ...props }) {
  return (
    <div className={`p-6 pb-4 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardBody({ children, className = '', ...props }) {
  return (
    <div className={`p-6 pt-0 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = '', ...props }) {
  return (
    <div className={`p-6 pt-0 border-t border-slate-100/5 ${className}`} {...props}>
      {children}
    </div>
  );
}

export default Card;
