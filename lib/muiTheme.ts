'use client';
import { createTheme } from '@mui/material/styles';

const shared: any = {
  shape: { borderRadius: 14 },
  typography: {
    fontFamily: "'Inter',-apple-system,BlinkMacSystemFont,sans-serif",
    fontWeightBold: 800,
    h1:{fontWeight:900},h2:{fontWeight:900},h3:{fontWeight:800},
    h4:{fontWeight:800},h5:{fontWeight:800},h6:{fontWeight:800},
  },
  components: {
    MuiButton: { styleOverrides: { root: { borderRadius:'12px',textTransform:'none',fontWeight:700,transition:'all .2s','&:active':{transform:'scale(0.97)'} } } },
    MuiIconButton: { styleOverrides: { root: { transition:'all .2s','&:active':{transform:'scale(0.88)'} } } },
    MuiChip: { styleOverrides: { root: { fontWeight:700,borderRadius:'8px' } } },
    MuiDialog: { styleOverrides: { paper: { borderRadius:'20px' } } },
    MuiLinearProgress: { styleOverrides: { root: { borderRadius:'99px' } } },
  },
};

export const lightTheme = createTheme({ ...shared, palette: {
  mode:'light', primary:{main:'#22c55e',dark:'#16a34a',light:'#4ade80'},
  secondary:{main:'#3b82f6',dark:'#2563eb'}, error:{main:'#ef4444'}, warning:{main:'#f97316'},
  success:{main:'#22c55e',dark:'#16a34a'}, background:{default:'#f6f8fa',paper:'#ffffff'},
  text:{primary:'#0f172a',secondary:'#475569'}, divider:'#e2e8f0',
}});

export const darkTheme = createTheme({ ...shared, palette: {
  mode:'dark', primary:{main:'#3fb950',dark:'#2ea043',light:'#56d364'},
  secondary:{main:'#58a6ff',dark:'#388bfd'}, error:{main:'#f85149'}, warning:{main:'#fb923c'},
  success:{main:'#3fb950',dark:'#2ea043'}, background:{default:'#0d1117',paper:'#161b22'},
  text:{primary:'#e6edf3',secondary:'#8b949e'}, divider:'#21262d',
}});

export const redTheme = createTheme({ ...shared, palette: {
  mode:'dark', primary:{main:'#f87171',dark:'#ef4444',light:'#fca5a5'},
  secondary:{main:'#fca5a5',dark:'#f87171'}, error:{main:'#ef4444'}, warning:{main:'#fb923c'},
  success:{main:'#f87171',dark:'#ef4444'}, background:{default:'#0d0505',paper:'#1a0808'},
  text:{primary:'#fef2f2',secondary:'#fca5a5'}, divider:'#3d1515',
}});
