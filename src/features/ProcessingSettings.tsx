import { Box, IconButton } from "@mui/material";
import { Remove } from "@mui/icons-material";
import useBscanStore from "../stores/bscan-store";
import { subtractAverage } from "../processing/data-processing/subtract-average";
import { useUndoRedoStore } from "../stores/undo-redo-store";
import { useShallow } from "zustand/shallow";

export default function ProcessingSettings() {
  const bscan = useBscanStore.use.bscan();
  const setBscan = useBscanStore.use.setBscan();

  const { addOperation } = useUndoRedoStore(
    useShallow((s) => ({
      addOperation: s.addOperation,
    })),
  );

  const handleRemoveAverageClick = () => {
    const data = subtractAverage(bscan);
    addOperation({ title: "Вычитание среднего", bscan: data }, [...bscan]);
    setBscan(data);
  };

  return (
    <Box
      sx={{
        height: "100%",
        background: "#eee",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, p: 1 }}>
        <IconButton aria-label="delete" onClick={handleRemoveAverageClick}>
          <Remove />
        </IconButton>
        <Box>Вычитание среднего</Box>
      </Box>
    </Box>
  );
}
