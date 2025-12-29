import { Box, FormControlLabel, FormGroup, Switch } from '@mui/material';
import { logAmplitude } from '../processing/log-amplitude';
import useDataProcessorStore from '../stores/data-processor-store';

export default function ProcessingSettings() {
  const logAmplitudeSelected = useDataProcessorStore.use.logAmplitudeSelected();
  const operations = useDataProcessorStore.use.operations();

  const setLogAmplitudeSelected =
    useDataProcessorStore.use.setLogAmplitudeSelected();
  const setOperations = useDataProcessorStore.use.setOperations();

  const handleChangeLogScale = () => {
    const val = !logAmplitudeSelected;
    if (val) {
      setOperations([...operations, logAmplitude]);
    } else setOperations(operations.filter((op) => op !== logAmplitude));
    setLogAmplitudeSelected(!logAmplitudeSelected);
  };

  return (
    <Box
      sx={{
        height: '100%',
        background: '#eee',
      }}
    >
      <FormGroup>
        <FormControlLabel
          control={
            <Switch
              checked={logAmplitudeSelected}
              onChange={handleChangeLogScale}
            />
          }
          label="Логарифмическая шкала"
          sx={{ color: '#444', fontSize: '8pt' }}
        />
      </FormGroup>
    </Box>
  );
}
