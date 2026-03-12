import {
  Box,
  IconButton,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  BlurLinear,
  Remove,
  SignalCellularAlt,
  StackedBarChart,
} from '@mui/icons-material';
import useBscanStore from '../../stores/bscan-store';
import { subtractAverage } from '../../processing/data-processing/subtract-average';
import { useUndoRedoStore } from '../../stores/undo-redo-store';
import { useShallow } from 'zustand/shallow';
import { savGolFilter } from '../../processing/data-processing/sav-gol-fliter';
import { useEffect, useState } from 'react';
import { subtractMedian } from '../../processing/data-processing/subtract-median';
import { dewow } from '../../processing/data-processing/dewow';
import { bandPassFilter } from '../../processing/data-processing/band-pass-filter';
import { fftFreqAxisHalf } from '../../processing/data-processing/fft-bscan';

export default function ProcessingSettings() {
  const minSavitzkyGolayWindowSize = 5;

  const bscan = useBscanStore.use.bscan();
  const dt = useBscanStore.use.dt();
  const setBscan = useBscanStore.use.setBscan();

  const { addOperation } = useUndoRedoStore(
    useShallow((s) => ({
      addOperation: s.addOperation,
    })),
  );

  const [windowSizeVert, setWindowSizeVert] = useState(7);
  const [polynomialVert, setPolynomialVert] = useState(3);
  const [windowSizeHor, setWindowSizeHor] = useState(5);
  const [polynomialHor, setPolynomialHor] = useState(3);
  const [subtractType, setSubtractType] = useState('median');
  const [windowSizeDewow, setWindowSizeDewow] = useState(21);
  const [lowStopFrequency, setLowStopFrequency] = useState(0);
  const [lowPassFrequency, setLowPassFrequency] = useState(0);
  const [highStopFrequency, setHighStopFrequency] = useState(0);
  const [highPassFrequency, setHighPassFrequency] = useState(0);
  const [minFrequency, setMinFrequency] = useState(0);
  const [maxFrequency, setMaxFrequency] = useState(0);

  useEffect(() => {
    const freqAxis = fftFreqAxisHalf(bscan[0].length, dt);
    setMinFrequency(Math.floor(freqAxis[0]));
    setMaxFrequency(Math.floor(freqAxis[freqAxis.length - 1]));
  }, [dt, bscan]);

  const handleSubtractClick = () => {
    if (subtractType === 'average') {
      const data = subtractAverage(bscan);
      addOperation({ title: 'Вычитание среднего', bscan: data }, [...bscan]);
      setBscan(data);
    } else if (subtractType === 'median') {
      const data = subtractMedian(bscan);
      addOperation({ title: 'Вычитание медианы', bscan: data }, [...bscan]);
      setBscan(data);
    }
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

  const handleChangeSubtractType = (
    _: React.SyntheticEvent,
    value: 'average' | 'median',
  ) => {
    if (value == null) return;
    setSubtractType(value);
  };

  const handleDewowClick = () => {
    const data = dewow(bscan, windowSizeDewow);
    addOperation({ title: 'Dewow', bscan: data }, [...bscan]);
    setBscan(data);
  };

  const handleLowPassClick = () => {
    const data = bandPassFilter(
      bscan,
      { stopHz: lowStopFrequency, passHz: lowPassFrequency },
      { passHz: minFrequency, stopHz: minFrequency },
      dt,
    );
    addOperation({ title: 'Фильтр нижних частот', bscan: data }, [...bscan]);
    setBscan(data);
  };

  const handleHighPassClick = () => {
    const data = bandPassFilter(
      bscan,
      { stopHz: maxFrequency, passHz: maxFrequency },
      { passHz: highStopFrequency, stopHz: highPassFrequency },
      dt,
    );
    addOperation({ title: 'Фильтр верхних частот', bscan: data }, [...bscan]);
    setBscan(data);
  };

  return (
    <Box
      sx={{
        height: '100%',
        background: '#eee',
      }}
    >
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 0.5 }}>
          <IconButton aria-label="delete" onClick={handleSubtractClick}>
            <Remove />
          </IconButton>
          <Box>Вычитание</Box>
          <ToggleButtonGroup
            size="small"
            color="primary"
            value={subtractType}
            exclusive
            onChange={handleChangeSubtractType}
            aria-label="Subtract"
          >
            <ToggleButton value="average">Среднее</ToggleButton>
            <ToggleButton value="median">Медиана</ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 0.5 }}>
          <IconButton aria-label="delete" onClick={handleDewowClick}>
            <Remove />
          </IconButton>
          <Box sx={{ mr: 4 }}>Dewow</Box>
          <TextField
            id="windowSizeDewow"
            label="Окно"
            value={windowSizeDewow}
            variant="standard"
            type="number"
            inputProps={{ step: 2, min: 3 }}
            onChange={(e) =>
              setWindowSizeDewow(
                getOddNumber(getNotNaNValue(e.target.value, 5), 3),
              )
            }
          />
        </Box>
      </Box>
      <Box>
        <Box
          sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 0.5, pb: 0 }}
        >
          <IconButton
            aria-label="delete"
            onClick={handleVertSmoothClick}
            sx={{ rotate: '90deg' }}
          >
            <BlurLinear />
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
            <BlurLinear />
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
          <IconButton aria-label="lowPassFilter" onClick={handleLowPassClick}>
            <StackedBarChart />
          </IconButton>
          <Box>Фильтр нижних частот </Box>
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
            id="lowPassStartFrequency"
            label="Pass frequency"
            value={lowStopFrequency}
            variant="standard"
            type="number"
            inputProps={{ step: 1, min: 0 }}
            onChange={(e) =>
              setLowStopFrequency(getNotNaNValue(e.target.value, minFrequency))
            }
            sx={{ display: 'flex', margin: '0.5em' }}
          />
          <TextField
            id="lowPassEndFrequency"
            label="Stop frequency"
            value={lowPassFrequency}
            variant="standard"
            type="number"
            inputProps={{ step: 1, min: lowStopFrequency }}
            onChange={(e) =>
              setLowPassFrequency(getNotNaNValue(e.target.value, maxFrequency))
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
          <IconButton aria-label="highPassFilter" onClick={handleHighPassClick}>
            <SignalCellularAlt />
          </IconButton>
          <Box>Фильтр верхних частот </Box>
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
            id="highPassStartFrequency"
            label="Pass frequency"
            value={highStopFrequency}
            variant="standard"
            type="number"
            inputProps={{ step: 1, min: 0 }}
            onChange={(e) =>
              setHighStopFrequency(getNotNaNValue(e.target.value, minFrequency))
            }
            sx={{ display: 'flex', margin: '0.5em' }}
          />
          <TextField
            id="highPassEndFrequency"
            label="Stop frequency"
            value={highPassFrequency}
            variant="standard"
            type="number"
            inputProps={{ step: 1, min: highStopFrequency }}
            onChange={(e) =>
              setHighPassFrequency(getNotNaNValue(e.target.value, maxFrequency))
            }
            sx={{ display: 'flex', margin: '0.5em' }}
          />
        </Box>
      </Box>
    </Box>
  );
}
