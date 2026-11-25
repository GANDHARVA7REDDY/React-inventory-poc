import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { Alert, Snackbar } from '@mui/material';

const NotificationContext = createContext(null);

/** App-wide snackbar: notify(message, severity = 'success' | 'error' | 'warning' | 'info'). */
export function NotificationProvider({ children }) {
  const [note, setNote] = useState(null);
  const notify = useCallback((message, severity = 'success') => {
    setNote({ message, severity, key: Date.now() });
  }, []);
  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <Snackbar
        key={note?.key}
        open={Boolean(note)}
        autoHideDuration={note?.severity === 'error' ? 8000 : 4500}
        onClose={(_, reason) => reason !== 'clickaway' && setNote(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {note ? (
          <Alert severity={note.severity} variant="filled" onClose={() => setNote(null)} sx={{ width: '100%' }}>
            {note.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </NotificationContext.Provider>
  );
}

export function useNotify() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotify must be used inside NotificationProvider');
  return ctx.notify;
}
