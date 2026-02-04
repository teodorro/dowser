import { Box, FormControlLabel, FormGroup, Switch } from "@mui/material";
import useVisualSettingsStore from "../stores/visual-settings-store";

export default function VisualSettings() {
  const logAmplitudeSelected =
    useVisualSettingsStore.use.logAmplitudeSelected();

  const setLogAmplitudeSelected =
    useVisualSettingsStore.use.setLogAmplitudeSelected();

  const handleChangeLogScale = () => {
    setLogAmplitudeSelected(!logAmplitudeSelected);
  };

  return (
    <Box
      sx={{
        height: "100%",
        background: "#eee",
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
          sx={{ color: "#444", fontSize: "8pt" }}
        />
      </FormGroup>
    </Box>
  );
}
