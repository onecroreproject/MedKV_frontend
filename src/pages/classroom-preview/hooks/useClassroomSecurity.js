import { useState, useEffect, useRef } from 'react';

/**
 * useClassroomSecurity
 *
 * Provides client-side protections for student live class sessions:
 * 1. Window Blur & Tab Switch Detection (pauses view when not focused)
 * 2. PrintScreen & Screenshot Shortcut Interception + Clipboard Clearing
 * 3. Inspect Element / DevTools & Source Code Shortcut Blocking
 * 4. Right-Click Context Menu Prevention
 *
 * @param {boolean} isStudent - Security features only activate for students
 */
export function useClassroomSecurity(isStudent = true) {
  const [isBlurred, setIsBlurred] = useState(false);
  const blurTimerRef = useRef(null);

  useEffect(() => {
    if (!isStudent) return;

    // ── 1. Window Blur & Tab Switch Handlers ────────────────────────────────
    const handleVisibilityChange = () => {
      if (document.hidden || document.visibilityState === 'hidden') {
        setIsBlurred(true);
      } else {
        if (blurTimerRef.current) clearTimeout(blurTimerRef.current);
        setIsBlurred(false);
      }
    };

    const handleWindowBlur = () => {
      // Small debounce (120ms) to prevent false positives when interacting with system dialogs
      if (blurTimerRef.current) clearTimeout(blurTimerRef.current);
      blurTimerRef.current = setTimeout(() => {
        if (document.hidden || !document.hasFocus()) {
          setIsBlurred(true);
        }
      }, 120);
    };

    const handleWindowFocus = () => {
      if (blurTimerRef.current) clearTimeout(blurTimerRef.current);
      setIsBlurred(false);
    };

    // ── 2. Keyboard Shortcut Blocker ─────────────────────────────────────────
    const handleKeyDown = (e) => {
      // PrintScreen / Screenshot key
      if (e.key === 'PrintScreen' || e.keyCode === 44) {
        e.preventDefault();
        e.stopPropagation();
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText('');
          }
        } catch (err) {
          // Ignore clipboard permission rejections
        }
        setIsBlurred(true);
        setTimeout(() => setIsBlurred(false), 2000);
        return false;
      }

      // Windows Snipping Tool: Win + Shift + S / Mac: Cmd + Shift + 3/4/5
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && ['S', 's', '3', '4', '5'].includes(e.key)) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Developer Tools: F12
      if (e.key === 'F12' || e.keyCode === 123) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Developer Tools: Ctrl + Shift + I / J / C (or Cmd + Option + I / J / C)
      if ((e.ctrlKey || e.metaKey) && (e.shiftKey || e.altKey) && ['I', 'i', 'J', 'j', 'C', 'c'].includes(e.key)) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // View Source: Ctrl + U / Cmd + U
      if ((e.ctrlKey || e.metaKey) && (e.key === 'u' || e.key === 'U')) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Save Page: Ctrl + S / Cmd + S
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Print Page: Ctrl + P / Cmd + P
      if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    const handleKeyUp = (e) => {
      if (e.key === 'PrintScreen' || e.keyCode === 44) {
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText('');
          }
        } catch (err) {}
      }
    };

    // ── 3. Right-Click Context Menu Prevention ──────────────────────────────
    const handleContextMenu = (e) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    // ── 4. DevTools Resizing Detection ──────────────────────────────────────
    const checkDevTools = () => {
      const threshold = 160;
      const widthDiff = window.outerWidth - window.innerWidth > threshold;
      const heightDiff = window.outerHeight - window.innerHeight > threshold;
      if (widthDiff || heightDiff) {
        setIsBlurred(true);
      }
    };

    // Attach listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);
    window.addEventListener('keydown', handleKeyDown, { capture: true });
    window.addEventListener('keyup', handleKeyUp, { capture: true });
    document.addEventListener('contextmenu', handleContextMenu, { capture: true });
    window.addEventListener('resize', checkDevTools);

    return () => {
      if (blurTimerRef.current) clearTimeout(blurTimerRef.current);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
      window.removeEventListener('keyup', handleKeyUp, { capture: true });
      document.removeEventListener('contextmenu', handleContextMenu, { capture: true });
      window.removeEventListener('resize', checkDevTools);
    };
  }, [isStudent]);

  return { isBlurred, setIsBlurred };
}
