import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const ColorModeContext = createContext(null);
const STORAGE_KEY = 'inventory-color-mode';

function getInitialMode() {
  try {
    const savedMode = window.localStorage.getItem(STORAGE_KEY);
    return savedMode === 'light' || savedMode === 'dark' ? savedMode : 'dark';
  } catch {
    return 'dark';
  }
}

/** Provides a persistent, app-wide light/dark mode preference. */
export function ColorModeProvider({ children }) {
  const [mode, setMode] = useState(getInitialMode);

  const toggleColorMode = useCallback(() => {
    setMode((currentMode) => {
      const nextMode = currentMode === 'dark' ? 'light' : 'dark';

      try {
        window.localStorage.setItem(STORAGE_KEY, nextMode);
      } catch {
        // The theme still changes for this session when storage is unavailable.
      }

      return nextMode;
    });
  }, []);

  const value = useMemo(() => ({ mode, toggleColorMode }), [mode, toggleColorMode]);

  return (
    <ColorModeContext.Provider value={value}>
      {children}
    </ColorModeContext.Provider>
  );
}

export function useColorMode() {
  const context = useContext(ColorModeContext);

  if (!context) {
    throw new Error('useColorMode must be used inside ColorModeProvider.');
  }

  return context;
}
