import { Box, TextField } from '@mui/material';
import { useEffect } from 'react';
import useBscanStore from '../../stores/bscan-store';
import useUiStore from '../../stores/ui-store';
import { AttributesModeType } from '../../types/attributes-types';
import useAttributesStore from '../../stores/attributes-store';

export default function AttributesAnalysis() {
  const bscan = useBscanStore.use.bscan();

  const setAttributesModeType = useUiStore.use.setAttributesModeType();
  const setAttributesMode = useUiStore.use.setAttributesMode();

  const windowSize = useAttributesStore.use.windowSize();
  const setWindowSize = useAttributesStore.use.setWindowSize();

  useEffect(() => {
    setAttributesMode(true);
    setAttributesModeType(AttributesModeType.PeakFrequencies);
    return () => {
      setAttributesMode(false);
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
      </Box>
    </Box>
  );
}
