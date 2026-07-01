import { useState, useEffect } from 'react';

/**
 * Global reactive state container reference for large scale applications.
 * Can be replaced by Zustand or Redux Toolkit, but written in vanilla React to prevent heavy dependencies.
 */
export const globalStore = {
  state: {
    theme: 'dark',
    user: null,
    academicCourseId: null,
    toasts: []
  },
  listeners: new Set(),
  
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  },
  
  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.listeners.forEach((listener) => listener(this.state));
  }
};

export function useGlobalStore() {
  const [state, setState] = useState(globalStore.state);
  
  useEffect(() => {
    return globalStore.subscribe((newState) => {
      setState(newState);
    });
  }, []);
  
  return [state, (newState) => globalStore.setState(newState)];
}
export default useGlobalStore;
