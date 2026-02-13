import { Box, IconButton, TextField } from '@mui/material';
import { BlurOn, Remove } from '@mui/icons-material';
import useBscanStore from '../stores/bscan-store';
import { subtractAverage } from '../processing/data-processing/subtract-average';
import { useUndoRedoStore } from '../stores/undo-redo-store';
import { useShallow } from 'zustand/shallow';
import { savGolFilter } from '../processing/data-processing/sav-gol-fliter';
import { useState } from 'react';

export default function ProcessingSettings() {
  const minSavitzkyGolayWindowSize = 5;
  const bscan = useBscanStore.use.bscan();
  const setBscan = useBscanStore.use.setBscan();

  const { addOperation } = useUndoRedoStore(
    useShallow((s) => ({
      addOperation: s.addOperation,
    })),
  );

  const [windowSizeVert, setWindowSizeVert] = useState(11);
  const [polynomialVert, setPolynomialVert] = useState(3);
  const [windowSizeHor, setWindowSizeHor] = useState(5);
  const [polynomialHor, setPolynomialHor] = useState(3);

  const handleRemoveAverageClick = () => {
    const data = subtractAverage(bscan);
    addOperation({ title: 'Вычитание среднего', bscan: data }, [...bscan]);
    setBscan(data);
  };

  const handleVertSmoothClick = () => {
    const data = savGolFilter(bscan, 'vertical', {
      windowSize: windowSizeVert,
      polynomial: polynomialVert,
    });
    addOperation({ title: 'Усреднение (С-Г) вертикальное', bscan: data }, [
      ...bscan,
    ]);
    setBscan(data);
  };

  const handleHorSmoothClick = () => {
    const data = savGolFilter(bscan, 'horizontal', { windowSize: 5 });
    addOperation({ title: 'Усреднение (С-Г) горизонтальное', bscan: data }, [
      ...bscan,
    ]);
    setBscan(data);
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

  const getOddNumber = (
    val: number | string | undefined,
    defaultVal: number = minSavitzkyGolayWindowSize,
  ): number => {
    let v = defaultVal;
    if (typeof val === 'number') {
      v = val;
    }
    if (typeof val === 'string') {
      const parsed = Number.parseInt(val);
      if (!Number.isNaN(parsed)) v = parsed;
    }

    if (v % 2 === 1) return Math.max(v, minSavitzkyGolayWindowSize);
    else
      return Math.max(
        getOddNumber(v + 1, defaultVal),
        minSavitzkyGolayWindowSize,
      );
  };

  return (
    <Box
      sx={{
        height: '100%',
        background: '#eee',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 0.5 }}>
        <IconButton aria-label="delete" onClick={handleRemoveAverageClick}>
          <Remove />
        </IconButton>
        <Box>Вычитание среднего</Box>
      </Box>
      <Box>
        <Box
          sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 0.5, pb: 0 }}
        >
          <IconButton aria-label="delete" onClick={handleVertSmoothClick}>
            <BlurOn />
          </IconButton>
          <Box>Усреднение (С-Г) вертикальное </Box>
        </Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            p: 0.5,
            pt: 0,
            ml: '2.5em',
          }}
        >
          <TextField
            id="windowSizeVert"
            label="Окно (нечетное)"
            value={windowSizeVert}
            variant="standard"
            type="number"
            inputProps={{ step: 2, min: minSavitzkyGolayWindowSize }}
            onChange={(e) =>
              setWindowSizeVert(
                getOddNumber(
                  getNotNaNValue(e.target.value, 11),
                  minSavitzkyGolayWindowSize,
                ),
              )
            }
            sx={{ display: 'flex', margin: '0.5em' }}
          />
          <TextField
            id="polynomial"
            label="Многочлен"
            value={polynomialVert}
            variant="standard"
            type="number"
            inputProps={{ step: 1, min: 2 }}
            onChange={(e) =>
              setPolynomialVert(getNotNaNValue(e.target.value, 3))
            }
            sx={{ display: 'flex', margin: '0.5em' }}
          />
        </Box>
      </Box>
      <Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            p: 0.5,
            pb: 0,
          }}
        >
          <IconButton aria-label="delete" onClick={handleHorSmoothClick}>
            <BlurOn />
          </IconButton>
          <Box>Усреднение (С-Г) горизонтальное </Box>
        </Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            p: 0.5,
            pt: 0,
            ml: '2.5em',
          }}
        >
          <TextField
            id="windowSizeHor"
            label="Окно (нечетное)"
            value={windowSizeHor}
            variant="standard"
            type="number"
            inputProps={{ step: 2, min: minSavitzkyGolayWindowSize }}
            onChange={(e) =>
              setWindowSizeHor(
                getOddNumber(
                  getNotNaNValue(e.target.value, minSavitzkyGolayWindowSize),
                ),
              )
            }
            sx={{ display: 'flex', margin: '0.5em' }}
          />
          <TextField
            id="polynomial"
            label="Многочлен"
            value={polynomialHor}
            variant="standard"
            type="number"
            inputProps={{ step: 1, min: 2 }}
            onChange={(e) =>
              setPolynomialHor(getNotNaNValue(e.target.value, 3))
            }
            sx={{ display: 'flex', margin: '0.5em' }}
          />
        </Box>
      </Box>
    </Box>
  );
}
