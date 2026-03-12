import {
  Box,
  IconButton,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import {
  BlurLinear,
  Remove,
  SignalCellularAlt,
  StackedBarChart,
  Waves,
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

  const [savGolWindowSizeVert, setSavGolWindowSizeVert] = useState(7);
  const [savGolPolynomialVert, setSavGolPolynomialVert] = useState(3);
  const [savGolWindowSizeHor, setSavGolWindowSizeHor] = useState(5);
  const [savGolPolynomialHor, setSavGolPolynomialHor] = useState(3);
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
      windowSize: savGolWindowSizeVert,
      polynomial: savGolPolynomialVert,
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

  const isDewowNumberValid = (num: number): boolean => {
    return num % 2 === 1 && num >= 3 && num < bscan[0].length - 1;
  };

  const getDewowHelperText = (num: number): string => {
    if (num < 3) return 'Число должно быть больше 2';
    if (num >= bscan[0].length - 1)
      return 'Число должно быть меньше ' + (bscan[0].length - 1);
    if (num % 2 === 0) return 'Число должно быть нечётным';
    return '';
  };

  const isSavGolVertWindowSizeValid = (num: number): boolean => {
    return (
      num % 2 === 1 &&
      num >= minSavitzkyGolayWindowSize &&
      num < bscan[0].length - 1
    );
  };

  const getSavGolVertWindowSizeHelperText = (num: number): string => {
    if (num < minSavitzkyGolayWindowSize)
      return 'Число должно быть больше ' + minSavitzkyGolayWindowSize;
    if (num >= bscan[0].length - 1)
      return 'Число должно быть меньше ' + (bscan[0].length - 1);
    if (num % 2 === 0) return 'Число должно быть нечётным';
    return '';
  };

  const isSavGolPolynomialValid = (num: number): boolean => {
    return num >= 2 && num <= 5;
  };

  const getSavGolPolynomialHelperText = (num: number): string => {
    if (num < 2) return 'Число должно быть больше 1';
    if (num > 5) return 'Число должно быть меньше 6';
    return '';
  };

  const isSavGolHorWindowSizeValid = (num: number): boolean => {
    return (
      num % 2 === 1 &&
      num >= minSavitzkyGolayWindowSize &&
      num < bscan.length - 1
    );
  };

  const getSavGolHorWindowSizeHelperText = (num: number): string => {
    if (num < minSavitzkyGolayWindowSize)
      return 'Число должно быть больше ' + minSavitzkyGolayWindowSize;
    if (num >= bscan.length - 1)
      return 'Число должно быть меньше ' + (bscan.length - 1);
    if (num % 2 === 0) return 'Число должно быть нечётным';
    return '';
  };

  const isLowStopFreqValid = (num: number): boolean => {
    return num >= lowPassFrequency && num <= maxFrequency;
  };

  const getLowStopFreqHelperText = (num: number): string => {
    if (num < lowPassFrequency)
      return 'Число должно быть больше границы пропускания';
    if (num > maxFrequency) return 'Число должно быть меньше ' + maxFrequency;
    return '';
  };

  const isLowPassFreqValid = (num: number): boolean => {
    return num >= 0 && num <= lowStopFrequency;
  };

  const getLowPassFreqHelperText = (num: number): string => {
    if (num < 0) return 'Число должно быть больше либо равно 0';
    if (num > lowStopFrequency)
      return 'Число должно быть меньше границы подавления';
    return '';
  };

  const isHighStopFreqValid = (num: number): boolean => {
    return num >= 0 && num <= highPassFrequency;
  };

  const getHighStopFreqHelperText = (num: number): string => {
    if (num > highPassFrequency)
      return 'Число должно быть меньше границы пропускания';
    if (num < 0) return 'Число должно быть больше 0';
    return '';
  };

  const isHighPassFreqValid = (num: number): boolean => {
    return num >= highStopFrequency && num <= maxFrequency;
  };

  const getHighPassFreqHelperText = (num: number): string => {
    if (num < highStopFrequency)
      return 'Число должно быть больше границы подавления';
    if (num > maxFrequency) return 'Число должно быть меньше ' + maxFrequency;
    return '';
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
          <Typography sx={{ color: 'text.primary' }}>Вычитание</Typography>
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
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            p: 0.5,
          }}
        >
          <IconButton
            aria-label="delete"
            onClick={handleDewowClick}
            disabled={!isDewowNumberValid(windowSizeDewow)}
          >
            <Waves />
          </IconButton>
          <Typography sx={{ mr: 4, color: 'text.primary' }}>Dewow</Typography>
          <TextField
            id="windowSizeDewow"
            label="Окно (нечётное)"
            value={windowSizeDewow}
            variant="standard"
            type="number"
            inputProps={{ step: 2, min: 3 }}
            onChange={(e) => setWindowSizeDewow(Number(e.target.value) || 0)}
            error={!isDewowNumberValid(windowSizeDewow)}
            helperText={getDewowHelperText(windowSizeDewow)}
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
            disabled={
              !isSavGolVertWindowSizeValid(savGolWindowSizeVert) ||
              !isSavGolPolynomialValid(savGolPolynomialVert)
            }
            sx={{ rotate: '90deg' }}
          >
            <BlurLinear />
          </IconButton>
          <Typography sx={{ color: 'text.primary' }}>
            Усреднение (С-Г) вертикальное{' '}
          </Typography>
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
            id="savGolWindowSizeVert"
            label="Окно (нечётное)"
            value={savGolWindowSizeVert}
            variant="standard"
            type="number"
            inputProps={{ step: 2, min: minSavitzkyGolayWindowSize }}
            onChange={(e) =>
              setSavGolWindowSizeVert(Number(e.target.value) || 0)
            }
            error={!isSavGolVertWindowSizeValid(savGolWindowSizeVert)}
            helperText={getSavGolVertWindowSizeHelperText(savGolWindowSizeVert)}
            sx={{ display: 'flex', margin: '0.5em' }}
          />
          <TextField
            id="polynomial"
            label="Многочлен"
            value={savGolPolynomialVert}
            variant="standard"
            type="number"
            inputProps={{ step: 1, min: 2 }}
            onChange={(e) =>
              setSavGolPolynomialVert(Number(e.target.value) || 0)
            }
            error={!isSavGolPolynomialValid(savGolPolynomialVert)}
            helperText={getSavGolPolynomialHelperText(savGolPolynomialVert)}
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
          <IconButton
            aria-label="delete"
            onClick={handleHorSmoothClick}
            disabled={
              !isSavGolHorWindowSizeValid(savGolWindowSizeHor) ||
              !isSavGolPolynomialValid(savGolPolynomialHor)
            }
          >
            <BlurLinear />
          </IconButton>
          <Typography sx={{ color: 'text.primary' }}>
            Усреднение (С-Г) горизонтальное{' '}
          </Typography>
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
            id="savGolWindowSizeHor"
            label="Окно (нечётное)"
            value={savGolWindowSizeHor}
            variant="standard"
            type="number"
            inputProps={{ step: 2, min: minSavitzkyGolayWindowSize }}
            onChange={(e) =>
              setSavGolWindowSizeHor(Number(e.target.value) || 0)
            }
            error={!isSavGolHorWindowSizeValid(savGolWindowSizeHor)}
            helperText={getSavGolHorWindowSizeHelperText(savGolWindowSizeHor)}
            sx={{ display: 'flex', margin: '0.5em' }}
          />
          <TextField
            id="polynomial"
            label="Многочлен"
            value={savGolPolynomialHor}
            variant="standard"
            type="number"
            inputProps={{ step: 1, min: 2 }}
            onChange={(e) =>
              setSavGolPolynomialHor(Number(e.target.value) || 0)
            }
            error={!isSavGolPolynomialValid(savGolPolynomialHor)}
            helperText={getSavGolPolynomialHelperText(savGolPolynomialHor)}
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
          <IconButton
            aria-label="lowPassFilter"
            onClick={handleLowPassClick}
            disabled={
              !isLowStopFreqValid(lowStopFrequency) ||
              !isLowPassFreqValid(lowPassFrequency)
            }
          >
            <StackedBarChart />
          </IconButton>
          <Typography sx={{ color: 'text.primary' }}>
            Фильтр нижних частот{' '}
          </Typography>
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
            id="lowStopFrequency"
            label="Граница подавления"
            value={lowStopFrequency}
            variant="standard"
            type="number"
            inputProps={{ step: 1, min: 0 }}
            onChange={(e) =>
              setLowStopFrequency(getNotNaNValue(e.target.value, 0))
            }
            error={!isLowStopFreqValid(lowStopFrequency)}
            helperText={getLowStopFreqHelperText(lowStopFrequency)}
            sx={{ display: 'flex', margin: '0.5em' }}
          />
          <TextField
            id="lowPassFrequency"
            label="Граница пропускания"
            value={lowPassFrequency}
            variant="standard"
            type="number"
            inputProps={{ step: 1, min: lowStopFrequency }}
            onChange={(e) =>
              setLowPassFrequency(getNotNaNValue(e.target.value, 0))
            }
            error={!isLowPassFreqValid(lowPassFrequency)}
            helperText={getLowPassFreqHelperText(lowPassFrequency)}
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
          <IconButton
            aria-label="highPassFilter"
            onClick={handleHighPassClick}
            disabled={
              !isHighStopFreqValid(highStopFrequency) ||
              !isHighPassFreqValid(highPassFrequency)
            }
          >
            <SignalCellularAlt />
          </IconButton>
          <Typography sx={{ color: 'text.primary' }}>
            Фильтр верхних частот{' '}
          </Typography>
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
            id="highStopFrequency"
            label="Граница подавления"
            value={highStopFrequency}
            variant="standard"
            type="number"
            inputProps={{ step: 1, min: 0 }}
            onChange={(e) =>
              setHighStopFrequency(getNotNaNValue(e.target.value, 0))
            }
            error={!isHighStopFreqValid(highStopFrequency)}
            helperText={getHighStopFreqHelperText(highStopFrequency)}
            sx={{ display: 'flex', margin: '0.5em' }}
          />
          <TextField
            id="highPassFrequency"
            label="Граница пропускания"
            value={highPassFrequency}
            variant="standard"
            type="number"
            inputProps={{ step: 1, min: highStopFrequency }}
            onChange={(e) =>
              setHighPassFrequency(getNotNaNValue(e.target.value, 0))
            }
            error={!isHighPassFreqValid(highPassFrequency)}
            helperText={getHighPassFreqHelperText(highPassFrequency)}
            sx={{ display: 'flex', margin: '0.5em' }}
          />
        </Box>
      </Box>
    </Box>
  );
}
