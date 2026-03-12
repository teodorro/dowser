import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    action: {
      active: '#3d3d3d', // Darker gray for icons and interactive elements (default was ~rgba(0,0,0,0.54))
      disabled: 'rgba(0, 0, 0, 0.26)',
      disabledBackground: 'rgba(0, 0, 0, 0.12)',
      hover: 'rgba(0, 0, 0, 0.04)',
      selected: 'rgba(0, 0, 0, 0.08)',
    },
    text: {
      primary: 'rgba(0, 0, 0, 0.87)',
      secondary: '#3d3d3d', // Match your preferred gray for secondary text
      disabled: 'rgba(0, 0, 0, 0.38)',
    },
  },
});
