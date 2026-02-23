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
import useVisualSettingsStore from '../stores/visual-settings-store';

export default function VisualSettings() {
  const selectedPalette = useVisualSettingsStore.use.selectedPalette();
  const logAmplitudeSelected =
    useVisualSettingsStore.use.logAmplitudeSelected();
  const logAmplitudeSelected2 =
    useVisualSettingsStore.use.logAmplitudeSelected2();

  const setLogAmplitudeSelected =
    useVisualSettingsStore.use.setLogAmplitudeSelected();
  const setLogAmplitudeSelected2 =
    useVisualSettingsStore.use.setLogAmplitudeSelected2();
  const setSelectedPalette = useVisualSettingsStore.use.setSelectedPalette();

  const handleChangeLogScale = () => {
    setLogAmplitudeSelected(!logAmplitudeSelected);
  };

  const handleChangeLogScale2 = () => {
    setLogAmplitudeSelected2(!logAmplitudeSelected2);
  };

  const handleChangePalette = (event: SelectChangeEvent<string>) => {
    setSelectedPalette(event.target.value);
  };

  return (
    <Box
      sx={{
        height: '100%',
        background: '#eee',
      }}
    >
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
    </Box>
  );
}
