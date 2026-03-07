import React from 'react';
import { Box, TextField } from '@mui/material';
import useBscanStore from '../../stores/bscan-store';

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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const val = getNotNaNValue(e.target.value, 1);
    setEps(val);
    setVelocity(speedLight / Math.sqrt(val));
  };

  const onVelocityChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const val = getNotNaNValue(e.target.value, 0.3);
    setVelocity(val);
    setEps((speedLight * speedLight) / val / val);
  };

  const getNotNaNValue = (
    val: number | string | undefined,
    defaultVal: number,
  ): number => {
    if (typeof val === 'number') return val;
    if (typeof val === 'string') {
      const parsed = Number.parseFloat(val);
      if (!Number.isNaN(parsed)) return parsed;
    }
    return defaultVal;
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
        onChange={(e) => setD(getNotNaNValue(e.target.value, 1))}
        sx={{ display: 'flex', margin: '0.5em' }}
      />

      <TextField
        id="dx"
        label="Шаг измерений, (м)"
        value={dx}
        variant="standard"
        type="number"
        inputProps={{ step: 0.05, min: 0.05 }}
        onChange={(e) => setDx(getNotNaNValue(e.target.value, 1))}
        sx={{ display: 'flex', margin: '0.5em' }}
      />

      <TextField
        id="dt"
        label="Шаг по времени, (нс)"
        value={dt}
        variant="standard"
        type="number"
        inputProps={{ step: 0.5, min: 0.5 }}
        onChange={(e) => setDt(getNotNaNValue(e.target.value, 1))}
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
        inputProps={{ step: 0.01, min: 0.03, max: 0.3 }}
        onChange={onVelocityChange}
        sx={{ display: 'flex', margin: '0.5em' }}
      />
    </Box>
  );
}
