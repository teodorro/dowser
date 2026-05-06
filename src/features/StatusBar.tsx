import { Box, Typography } from '@mui/material';
import useBscanStore from '../stores/bscan-store';
import { fftFreqAxisHalf } from '../processing/data-processing/fft-bscan';
import { useEffect, useState } from 'react';
import useUiStore from '../stores/ui-store';
import useAttributesStore from '../stores/attributes-store';
import { AttributesModeType } from '../types/attributes-types';

export default function StatusBar() {
  const indexAscan = useBscanStore.use.indexAscan();
  const indexT = useBscanStore.use.indexT();
  const bscan = useBscanStore.use.bscan();
  const bscanFft = useBscanStore.use.bscanFft();
  const selectedAttribute = useAttributesStore.use.selectedAttribute();
  const peakFrequencies = useAttributesStore.use.peakFrequencies();
  const spectrumWidths = useAttributesStore.use.spectrumWidths();
  const qualityFactors = useAttributesStore.use.qualityFactors();
  const coherence = useAttributesStore.use.coherence();
  const viewMode = useUiStore.use.viewMode();
  const dx = useBscanStore.use.dx();
  const dt = useBscanStore.use.dt();
  const velocity = useBscanStore.use.velocity();

  const [freqs, setFreqs] = useState<number[]>([]);

  useEffect(() => {
    if (bscanFft == null || bscanFft.length === 0) return;
    const freqs = fftFreqAxisHalf(bscanFft[0].length, dt);
    setFreqs(freqs);
  }, [bscanFft, dt]);

  const getAmp = () => {
    const a =
      indexAscan == null || indexT == null
        ? ''
        : Math.round(bscan[indexAscan][indexT] * 100) / 100;
    return a;
  };

  const getVal = () => {
    let profile: number[][] = [];
    switch (selectedAttribute) {
      case AttributesModeType.PeakFrequencies:
        profile = peakFrequencies;
        break;
      case AttributesModeType.SpectrumWidths:
        profile = spectrumWidths;
        break;
      case AttributesModeType.QualityFactors:
        profile = qualityFactors;
        break;
      case AttributesModeType.Coherence:
        profile = coherence;
        break;
    }
    const a =
      indexAscan == null || indexT == null
        ? ''
        : Math.round(profile[indexAscan][indexT] * 100) / 100;
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

      {viewMode.type !== 'fft' && (
        <Typography
          sx={{ color: '#444', px: 1, width: '5em', textAlign: 'left' }}
        >
          t: {indexT == null ? '' : indexT * dt}
        </Typography>
      )}

      {viewMode.type !== 'fft' && (
        <Typography
          sx={{ color: '#444', px: 1, width: '5em', textAlign: 'left' }}
        >
          y:{' '}
          {indexT == null ? '' : Math.round(indexT * dt * velocity * 100) / 100}
        </Typography>
      )}
      {viewMode.type === 'fft' && (
        <Typography
          sx={{ color: '#444', px: 1, width: '7em', textAlign: 'left' }}
        >
          f: {indexT != null ? Math.round(freqs[indexT] * 100) / 100 : ''}
        </Typography>
      )}

      {viewMode.type !== 'attributes' && (
        <Typography
          sx={{ color: '#444', px: 1, width: '10em', textAlign: 'left' }}
        >
          amp: {getAmp()}
        </Typography>
      )}

      {viewMode.type === 'attributes' && (
        <Typography
          sx={{ color: '#444', px: 1, width: '10em', textAlign: 'left' }}
        >
          val: {getVal()}
        </Typography>
      )}
    </Box>
  );
}
