import React from 'react';
import { Box, TextField } from '@mui/material';
import useBscanStore from '../stores/bscan-store';

export default function DataSettings() {
  const speedLight = 0.3;
  const d = useBscanStore.use.d();
  const dx = useBscanStore.use.dx();
  const dt = useBscanStore.use.dt();
  const eps = useBscanStore.use.eps();
  const velocity = useBscanStore.use.velocity();
  const setD = useBscanStore.use.setD();
  const setDx = useBscanStore.use.setDx();
  const setDt = useBscanStore.use.setDt();
  const setEps = useBscanStore.use.setEps();
  const setVelocity = useBscanStore.use.setVelocity();

  const onPermittivityChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const val = Number.parseFloat(e.target.value);
    setEps(val);
    setVelocity(speedLight / Math.sqrt(val));
  };

  const onVelocityChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const val = Number.parseFloat(e.target.value);
    setVelocity(val);
    setEps((speedLight * speedLight) / val / val);
  };

  return (
    <Box
      sx={{
        height: '100%',
        background: '#eee',
      }}
    >
      <TextField
        id="d"
        label="Расстояние между антеннами, (м)"
        value={d}
        variant="standard"
        type="number"
        inputProps={{ step: 0.05, min: 0.05 }}
        onChange={(e) => setD(Number.parseFloat(e.target.value))}
        sx={{ display: 'flex', margin: '0.5em' }}
      />

      <TextField
        id="dx"
        label="Шаг измерений, (м)"
        value={dx}
        variant="standard"
        type="number"
        inputProps={{ step: 0.05, min: 0.05 }}
        onChange={(e) => setDx(Number.parseFloat(e.target.value))}
        sx={{ display: 'flex', margin: '0.5em' }}
      />

      <TextField
        id="dt"
        label="Шаг по времени, (нс)"
        value={dt}
        variant="standard"
        type="number"
        inputProps={{ step: 0.5, min: 0.5 }}
        onChange={(e) => setDt(Number.parseFloat(e.target.value))}
        sx={{ display: 'flex', margin: '0.5em' }}
      />

      <TextField
        id="eps"
        label="Диэлектрическая проницаемость"
        value={eps}
        variant="standard"
        type="number"
        inputProps={{ step: 1, min: 1, max: 81 }}
        onChange={onPermittivityChange}
        sx={{ display: 'flex', margin: '0.5em' }}
      />

      <TextField
        id="velocity"
        label="Скорость в грунте"
        value={velocity}
        variant="standard"
        type="number"
        inputProps={{ step: 0.01, min: 0, max: 0.3 }}
        onChange={onVelocityChange}
        sx={{ display: 'flex', margin: '0.5em' }}
      />
    </Box>
  );
}
