import {
  Box,
  InputLabel,
  Select,
  FormControl,
  MenuItem,
  TextField,
  type SelectChangeEvent,
} from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import useBscanStore from '../../stores/bscan-store';
import useUiStore from '../../stores/ui-store';
import { AttributesModeType } from '../../types/attributes-types';
import useAttributesStore from '../../stores/attributes-store';
import { PlayCircle } from '@mui/icons-material';
import { IconButton } from '@mui/material';

export default function AttributesAnalysis() {
  const bscan = useBscanStore.use.bscan();
  const dt = useBscanStore.use.dt();

  const windowSize = useAttributesStore.use.windowSize();
  const selectedAttribute = useAttributesStore.use.selectedAttribute();

  const setPeakFrequencies = useAttributesStore.use.setPeakFrequencies();
  const setSpectrumWidths = useAttributesStore.use.setSpectrumWidths();
  const setQualityFactors = useAttributesStore.use.setQualityFactors();
  const setCoherence = useAttributesStore.use.setCoherence();
  const setWindowSize = useAttributesStore.use.setWindowSize();
  const setSelectedAttribute = useAttributesStore.use.setSelectedAttribute();

  const setAttributesModeType = useUiStore.use.setAttributesModeType();
  const setAttributesMode = useUiStore.use.setAttributesMode();
  const setIsLoading = useUiStore.use.setIsLoading();

  const workerRef = useRef<Worker | null>(null);

  const [window, setWindow] = useState(windowSize);

  useEffect(() => {
    setWindow(windowSize);
    setAttributesMode(true);
    setAttributesModeType(AttributesModeType.PeakFrequencies);

    const worker = new Worker(
      new URL('../attributes/attributes-worker.ts', import.meta.url),
      { type: 'module' },
    );

    worker.onmessage = (
      e: MessageEvent<{
        type:
          | 'peakFrequencies'
          | 'spectrumWidths'
          | 'qualityFactors'
          | 'coherence';
        result: number[][];
      }>,
    ) => {
      if (e.data.type === 'peakFrequencies') {
        setPeakFrequencies(e.data.result);
      } else if (e.data.type === 'spectrumWidths') {
        setSpectrumWidths(e.data.result);
      } else if (e.data.type === 'qualityFactors') {
        setQualityFactors(e.data.result);
      } else if (e.data.type === 'coherence') {
        setCoherence(e.data.result);
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

  const handleRunAnalysisButtonClick = () => {
    setWindowSize(window);
  };

  return (
    <Box
      sx={{
        height: '100%',
        background: '#eee',
      }}
    >
      <Box sx={{ p: 0.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton
            aria-label="run-analysis"
            sx={{ m: '0.1em' }}
            onClick={() => handleRunAnalysisButtonClick()}
          >
            <PlayCircle></PlayCircle>
          </IconButton>
          <TextField
            id="window"
            label="Размер окна"
            value={window}
            variant="standard"
            type="number"
            inputProps={{ step: 1, min: 1 }}
            onChange={(e) => setWindow(getNotNaNValue(e.target.value, 0))}
            error={!isLowStopFreqValid(window)}
            helperText={getLowStopFreqHelperText(window)}
            sx={{ display: 'flex', margin: '0.5em' }}
          />
        </Box>
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
