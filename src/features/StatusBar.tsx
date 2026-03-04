import { Box, Typography } from '@mui/material';
import useBscanStore from '../stores/bscan-store';

export default function StatusBar() {
  const indexAscan = useBscanStore.use.indexAscan();
  const indexT = useBscanStore.use.indexT();
  const bscanToShow = useBscanStore.use.bscanToShow();
  const dx = useBscanStore.use.dx();
  const dt = useBscanStore.use.dt();
  const velocity = useBscanStore.use.velocity();

  const getAmp = () => {
    const a =
      indexAscan == null || indexT == null
        ? ''
        : Math.round(bscanToShow[indexAscan][indexT] * 100) / 100;
    return a;
  };

  return (
    <Box
      sx={{
        height: '2em',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        background: '#eee',
        gap: 0.5,
      }}
    >
      <Typography
        sx={{ color: '#444', px: 1, width: '5em', textAlign: 'left' }}
      >
        x: {indexAscan == null ? '' : Math.round(indexAscan * dx * 100) / 100}
      </Typography>

      <Typography
        sx={{ color: '#444', px: 1, width: '5em', textAlign: 'left' }}
      >
        t: {indexT == null ? '' : indexT * dt}
      </Typography>

      <Typography
        sx={{ color: '#444', px: 1, width: '5em', textAlign: 'left' }}
      >
        z:{' '}
        {indexT == null ? '' : Math.round(indexT * dt * velocity * 100) / 100}
      </Typography>

      <Typography
        sx={{ color: '#444', px: 1, width: '7em', textAlign: 'left' }}
      >
        amp: {getAmp()}
      </Typography>
    </Box>
  );
}
