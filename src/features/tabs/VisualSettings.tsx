import {
  Box,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Switch,
  Typography,
  type SelectChangeEvent,
} from '@mui/material';
import useVisualSettingsStore from '../../stores/visual-settings-store';
import useUiStore from '../../stores/ui-store';

export default function VisualSettings() {
  const fftMode = useUiStore.use.fftMode();

  const selectedPalette = useVisualSettingsStore.use.selectedPalette();
  const selectedPaletteSpectrum =
    useVisualSettingsStore.use.selectedPaletteSpectrum();
  const logAmplitudeSelected =
    useVisualSettingsStore.use.logAmplitudeSelected();
  const logAmplitudeSelected2 =
    useVisualSettingsStore.use.logAmplitudeSelected2();
  const logAmplitudeSelectedSpectrum =
    useVisualSettingsStore.use.logAmplitudeSelectedSpectrum();

  const setLogAmplitudeSelected =
    useVisualSettingsStore.use.setLogAmplitudeSelected();
  const setLogAmplitudeSelected2 =
    useVisualSettingsStore.use.setLogAmplitudeSelected2();
  const setSelectedPalette = useVisualSettingsStore.use.setSelectedPalette();
  const setLogAmplitudeSelectedSpectrum =
    useVisualSettingsStore.use.setLogAmplitudeSelectedSpectrum();
  const setSelectedPaletteSpectrum =
    useVisualSettingsStore.use.setSelectedPaletteSpectrum();

  const handleChangeLogScale = () => {
    setLogAmplitudeSelected(!logAmplitudeSelected);
  };

  const handleChangeLogScale2 = () => {
    setLogAmplitudeSelected2(!logAmplitudeSelected2);
  };

  const handleChangePalette = (event: SelectChangeEvent<string>) => {
    setSelectedPalette(event.target.value);
  };
  const handleChangeLogScaleSpectrum = () => {
    setLogAmplitudeSelectedSpectrum(!logAmplitudeSelectedSpectrum);
  };
  const handleChangePaletteSpectrum = (event: SelectChangeEvent<string>) => {
    setSelectedPaletteSpectrum(event.target.value);
  };

  return (
    <Box
      sx={{
        height: '100%',
        background: '#eee',
      }}
    >
      {!fftMode && (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Switch
            checked={logAmplitudeSelected}
            onChange={handleChangeLogScale}
          />
          <Switch
            checked={logAmplitudeSelected2}
            onChange={handleChangeLogScale2}
          />
          <Box>
            <Typography>Логарифмическая шкала</Typography>
          </Box>
        </Box>
      )}
      {!fftMode && (
        <FormControl
          fullWidth
          sx={{ padding: '0.5em', mt: '1em', size: 'small' }}
        >
          <InputLabel id="select-palettes-label">Палитра</InputLabel>
          <Select
            labelId="select-palettes-label"
            id="select-palettes"
            value={selectedPalette}
            label="Палитра"
            onChange={handleChangePalette}
            size="small"
          >
            <MenuItem value="greys">Greys</MenuItem>
            <MenuItem value="viridis">Viridis</MenuItem>
            <MenuItem value="turbo">Turbo</MenuItem>
            <MenuItem value="spectral">Spectral</MenuItem>
            <MenuItem value="cubehelixDefault">Cubehelix</MenuItem>
            <MenuItem value="magma">Magma</MenuItem>
            <MenuItem value="rainbow">Rainbow</MenuItem>
          </Select>
        </FormControl>
      )}

      {fftMode && (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Switch
            checked={logAmplitudeSelectedSpectrum}
            onChange={handleChangeLogScaleSpectrum}
          />
          <Box>
            <Typography>Логарифмическая шкала</Typography>
          </Box>
        </Box>
      )}
      {fftMode && (
        <FormControl
          fullWidth
          sx={{ padding: '0.5em', mt: '1em', size: 'small' }}
        >
          <InputLabel id="select-palettes-label">Палитра</InputLabel>
          <Select
            labelId="select-palettes-label"
            id="select-palettes"
            value={selectedPaletteSpectrum}
            label="Палитра"
            onChange={handleChangePaletteSpectrum}
            size="small"
          >
            <MenuItem value="greys">Greys</MenuItem>
            <MenuItem value="viridis">Viridis</MenuItem>
            <MenuItem value="turbo">Turbo</MenuItem>
            <MenuItem value="spectral">Spectral</MenuItem>
            <MenuItem value="cubehelixDefault">Cubehelix</MenuItem>
            <MenuItem value="magma">Magma</MenuItem>
            <MenuItem value="rainbow">Rainbow</MenuItem>
          </Select>
        </FormControl>
      )}
    </Box>
  );
}
