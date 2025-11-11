import { Box, TextField } from '@mui/material';
import React from 'react';
import useBscanStore from './stores/bscan-store';

export default function DataSettings() {
  const d = useBscanStore((s) => s.d);
  const dx = useBscanStore((s) => s.dx);
  const dt = useBscanStore((s) => s.dt);
  const setD = useBscanStore((s) => s.setD);
  const setDx = useBscanStore((s) => s.setDx);
  const setDt = useBscanStore((s) => s.setDt);

  return (
    <Box sx={{ width: '15em', height: '100%', background: '#aaa' }}>
      <Box>
        <TextField
          id="d"
          label="Расстояние между антеннами, (м)"
          value={d}
          variant="standard"
          type="number"
          inputProps={{ step: 0.05, min: 0.05 }}
          onChange={(e) => setD(Number.parseFloat(e.target.value))}
        />
      </Box>

      <Box>
        <TextField
          id="dx"
          label="Шаг измерений, (м)"
          value={dx}
          variant="standard"
          type="number"
          inputProps={{ step: 0.05, min: 0.05 }}
          onChange={(e) => setDx(Number.parseFloat(e.target.value))}
        />
      </Box>

      <Box>
        <TextField
          id="dt"
          label="Шаг по времени, (нс)"
          value={dt}
          variant="standard"
          type="number"
          inputProps={{ step: 0.5, min: 0.5 }}
          onChange={(e) => setDt(Number.parseFloat(e.target.value))}
        />
      </Box>
    </Box>
  );
}
