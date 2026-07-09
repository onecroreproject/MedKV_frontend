import React from 'react';

/**
 * Reusable button component matching the brand guide styles.
 */
export function Button({
  children,
  variant = 'primary', // 'primary', 'secondary', 'outline', 'ghost'
  size = 'md',        // 'sm', 'md', 'lg'
  className = '',
  icon,
  iconPosition = 'left',
  ...props
}) {
  // Base classes for micro-animations and transition states
  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-accent/50 active:scale-98 cursor-pointer select-none';

  // Variant mapping using Poppins & precise HEX values
  const variants = {
    primary: 'bg-primary text-white border border-transparent shadow-[0_4px_14px_0_rgba(11,31,77,0.3)] hover:bg-[#071433] hover:shadow-[0_6px_20px_0_rgba(11,31,77,0.4)] hover:translate-y-[-1px]',
    secondary: 'bg-accent text-white border border-transparent shadow-[0_4px_14px_0_rgba(200,155,60,0.3)] hover:bg-[#A8802E] hover:shadow-[0_6px_20px_0_rgba(200,155,60,0.4)] hover:translate-y-[-1px]',
    outline: 'bg-transparent text-primary border-2 border-primary hover:bg-primary hover:text-white hover:shadow-[0_4px_14px_0_rgba(11,31,77,0.2)]',
    ghost: 'bg-transparent text-primary hover:bg-soft-gray'
  };

  // Size mapping
  const sizes = {
    sm: 'px-4 py-1.5 text-xs',
    md: 'px-6 py-2.5 text-sm tracking-wide',
    lg: 'px-8 py-3.5 text-base tracking-wide'
  };

  const selectedVariant = variants[variant] || variants.primary;
  const selectedSize = sizes[size] || sizes.md;

  return (
    <button
      className={`${baseClasses} ${selectedVariant} ${selectedSize} ${className}`}
      {...props}
    >
      {icon && iconPosition === 'left' && (
        <span className="mr-2 inline-flex items-center justify-center">{icon}</span>
      )}
      {children}
      {icon && iconPosition === 'right' && (
        <span className="ml-2 inline-flex items-center justify-center">{icon}</span>
      )}
    </button>
  );
}

export default Button;
