'use client';
import { ThemeProvider as AppThemeProvider, useTheme } from '@/lib/ThemeContext';
import { AudioProvider } from '@/lib/AudioContext';
import { AuthProvider } from '@/lib/AuthContext';
import { WordsProvider } from '@/lib/WordsContext';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { lightTheme, darkTheme, redTheme } from '@/lib/muiTheme';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ReactNode } from 'react';

function MuiWrapper({ children }: { children: ReactNode }) {
  const { theme } = useTheme();
  const muiTheme = theme === 'dark' ? darkTheme : theme === 'red' ? redTheme : lightTheme;
  return (
    <MuiThemeProvider theme={muiTheme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
}

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
      <AppThemeProvider>
        <AuthProvider>
          <AudioProvider>
            <WordsProvider>
              <MuiWrapper>{children}</MuiWrapper>
            </WordsProvider>
          </AudioProvider>
        </AuthProvider>
      </AppThemeProvider>
    </GoogleOAuthProvider>
  );
}
