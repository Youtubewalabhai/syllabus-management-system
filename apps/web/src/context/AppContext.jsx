import { createContext, useMemo, useState } from 'react';
import { createTheme, ThemeProvider } from '@mui/material';

const AppContext = createContext(null);

function AppProvider({ children }) {
  const [mode, setMode] = useState('light');
  const [role, setRole] = useState('student');

  const theme = useMemo(() => createTheme({ palette: { mode } }), [mode]);

  const value = useMemo(
    () => ({
      mode,
      role,
      setRole,
      toggleTheme: () => setMode((prev) => (prev === 'light' ? 'dark' : 'light'))
    }),
    [mode, role]
  );

  return (
    <AppContext.Provider value={value}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </AppContext.Provider>
  );
}

export { AppContext, AppProvider };
