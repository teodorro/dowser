import { Box } from '@mui/material';
import { useEffect } from 'react';

export default function SpectrumSettings() {
  useEffect(() => {
    console.log('SpectrumSettings');
  }, []);

  return (
    <Box
      sx={{
        height: '100%',
        background: '#eee',
      }}
    >
      Spectrum
    </Box>
  );
}
