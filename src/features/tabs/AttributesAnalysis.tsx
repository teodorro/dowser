import {
  Box,
  InputLabel,
  Select,
  FormControl,
  MenuItem,
  TextField,
  type SelectChangeEvent,
} from '@mui/material';
import { useEffect, useRef } from 'react';
import useBscanStore from '../../stores/bscan-store';
import useUiStore from '../../stores/ui-store';
import { AttributesModeType } from '../../types/attributes-types';
import useAttributesStore from '../../stores/attributes-store';

export default function AttributesAnalysis() {
  const bscan = useBscanStore.use.bscan();
  const dt = useBscanStore.use.dt();

  const windowSize = useAttributesStore.use.windowSize();
  const selectedAttribute = useAttributesStore.use.selectedAttribute();

  const setPeakFrequencies = useAttributesStore.use.setPeakFrequencies();
  const setSpectrumWidths = useAttributesStore.use.setSpectrumWidths();
  const setWindowSize = useAttributesStore.use.setWindowSize();
  const setSelectedAttribute = useAttributesStore.use.setSelectedAttribute();

  const setAttributesModeType = useUiStore.use.setAttributesModeType();
  const setAttributesMode = useUiStore.use.setAttributesMode();
  const setIsLoading = useUiStore.use.setIsLoading();

  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    setAttributesMode(true);
    setAttributesModeType(AttributesModeType.PeakFrequencies);

    const worker = new Worker(
      new URL('../attributes/attributes-worker.ts', import.meta.url),
      { type: 'module' },
    );

    worker.onmessage = (
      e: MessageEvent<{
        type: 'peakFrequencies' | 'spectrumWidths';
        result: number[][];
      }>,
    ) => {
      if (e.data.type === 'peakFrequencies') {
        setPeakFrequencies(e.data.result);
      } else {
        setSpectrumWidths(e.data.result);
      }

      setIsLoading(false);
    };

    workerRef.current = worker;

    return () => {
      setAttributesMode(false);
      worker.terminate();
      workerRef.current = null;
    };
  }, []);

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

  const isLowStopFreqValid = (num: number): boolean => {
    return num >= 1 && num <= bscan[0].length - 1;
  };

  const getLowStopFreqHelperText = (num: number): string => {
    if (num < 1) return 'Число должно быть 0';
    if (num > bscan[0].length - 1)
      return 'Число должно быть меньше ' + (bscan[0].length - 1);
    return '';
  };

  const runAnalysis = (attribute: AttributesModeType) => {
    setSelectedAttribute(attribute);
    if (!bscan.length) return;

    setIsLoading(true);

    workerRef.current?.postMessage({
      type: attribute,
      bscan,
      dt,
      windowSize,
    });
  };

  const handleChangeAttribute = (event: SelectChangeEvent<string>) => {
    const attribute = event.target.value as AttributesModeType;
    runAnalysis(attribute);
  };

  return (
    <Box
      sx={{
        height: '100%',
        background: '#eee',
      }}
    >
      <Box>
        <TextField
          id="windowSize"
          label="Размер окна"
          value={windowSize}
          variant="standard"
          type="number"
          inputProps={{ step: 1, min: 1 }}
          onChange={(e) => setWindowSize(getNotNaNValue(e.target.value, 0))}
          error={!isLowStopFreqValid(windowSize)}
          helperText={getLowStopFreqHelperText(windowSize)}
          sx={{ display: 'flex', margin: '0.5em' }}
        />
        <FormControl
          fullWidth
          sx={{ padding: '0.5em', mt: '1em', size: 'small' }}
        >
          <InputLabel id="select-attribute-label">Атрибут</InputLabel>
          <Select
            labelId="select-attribute-label"
            id="select-attribute"
            value={selectedAttribute}
            label="Атрибут"
            onChange={handleChangeAttribute}
            size="small"
          >
            <MenuItem value="peakFrequencies">Пиковая частота</MenuItem>
            <MenuItem value="spectrumWidths">Спектральная ширина</MenuItem>
            <MenuItem value="qualityFactors">Добротность</MenuItem>
            <MenuItem value="coherence">Когерентность</MenuItem>
          </Select>
        </FormControl>
      </Box>
    </Box>
  );
}
