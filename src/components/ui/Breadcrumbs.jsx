import React from 'react';

/**
 * Minimalist Breadcrumbs Component (Matches reference image)
 * Renders a clean, text-only path tracker with simple '>' separators.
 * 
 * @param {Array} paths - List of breadcrumb route nodes: { label: string, view: string, tab?: string, param?: any, icon?: ReactNode }
 * @param {Function} onNavigate - Routing callback handler
 * @param {string} variant - Theme mode: 'light' (default slate colors for white pages) or 'dark' (white colors for dark pages)
 * @param {string} className - Additional CSS wrapper classes
 */
export function Breadcrumbs({ paths, onNavigate, variant = "light", className = "" }) {
  if (!paths || paths.length === 0) return null;

  const isDark = variant === "dark";

  return (
    <nav 
      aria-label="Breadcrumb" 
      className={`flex items-center py-1 text-xs md:text-[13px] font-normal tracking-wide select-none ${className}`}
    >
      <ol className="flex items-center space-x-2 flex-wrap">
        {paths.map((path, index) => {
          const isLast = index === paths.length - 1;
          
          return (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <span className={`mx-2 text-[10px] md:text-[11px] font-light ${
                  isDark ? "text-white/30" : "text-slate-400"
                }`}>
                  &gt;
                </span>
              )}
              
              {isLast ? (
                <span className={`font-semibold ${
                  isDark ? "text-accent" : "text-slate-800"
                }`}>
                  {path.label}
                </span>
              ) : (
                <button
                  onClick={() => {
                    if (onNavigate) {
                      if (path.tab) {
                        onNavigate(path.view || 'dashboard', path.tab);
                      } else {
                        onNavigate(path.view, path.param);
                      }
                    }
                  }}
                  className={`transition-colors duration-200 cursor-pointer focus:outline-none flex items-center ${
                    isDark 
                      ? "text-slate-400 hover:text-white" 
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {path.icon && <span className="mr-1.5">{path.icon}</span>}
                  {path.label}
                </button>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default Breadcrumbs;
