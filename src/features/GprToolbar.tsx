import {
  AppBar,
  Box,
  IconButton,
  styled,
  Toolbar,
  Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { DarkMode, FolderOpen } from "@mui/icons-material";
import { readKrotTxtFile } from "../read-file/read-krot-txt-file";
import useBscanStore from "../stores/bscan-store";
import { readGeoFile } from "../read-file/read-geo-file";
import { readGemFile } from "../read-file/read-gem-file";
import UndoRedo from "./UndoRedo";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

export default function GprToolbar() {
  const setBscanFullAmp = useBscanStore.use.setBscanFullAmp();

  const onLoadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files == null || files.length === 0) return;
    const file = files[0];
    if (!file) return;
    const extension = file.name.split(".")[file.name.split(".").length - 1];
    console.log(file);
    switch (extension) {
      case "txt":
        loadTxtFile(file);
        break;
      case "geo":
        loadGeoFile(file);
        break;
      case "gem":
        loadGemFile(file);
        break;
      default:
        break;
    }
  };

  const loadTxtFile = async (file: File) => {
    try {
      if (file.size > 5 * 1024 * 1024) {
        console.warn("File is large; consider streaming.");
      }

      const raw = await file.text();
      const krotdata = readKrotTxtFile(raw);
      setBscanFullAmp(krotdata);
    } catch (err) {
      console.error("Failed to read file:", err);
    }
  };

  const loadGeoFile = async (file: File) => {
    const reader = new FileReader();

    reader.onload = () => {
      const buffer = reader.result as ArrayBuffer; // FileReader gives ArrayBuffer here
      const uint8 = new Uint8Array(buffer);
      const data = readGeoFile(uint8);
      setBscanFullAmp(data);
    };

    reader.onerror = () => {
      // setError('Failed to read file');
      setBscanFullAmp([]);
    };

    reader.readAsArrayBuffer(file);
  };

  const loadGemFile = async (file: File) => {
    const reader = new FileReader();

    reader.onload = () => {
      const buffer = reader.result as ArrayBuffer; // FileReader gives ArrayBuffer here
      const uint8 = new Uint8Array(buffer);
      const data = readGemFile(uint8);
      setBscanFullAmp(data);
    };

    reader.onerror = () => {
      // setError('Failed to read file');
      setBscanFullAmp([]);
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <Box sx={{ flexGrow: 1, height: "3em" }}>
      <AppBar position="static" sx={{ height: "3em" }}>
        <Toolbar
          variant="dense"
          disableGutters
          sx={{
            height: "3em",
            minHeight: "3em", // <-- the important part
            px: 1, // add your own padding since gutters are off
            alignItems: "center", // usually already true, but explicit is fine
          }}
        >
          <IconButton
            component="label"
            size="medium"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ m: 0.5 }}
          >
            <FolderOpen></FolderOpen>
            <VisuallyHiddenInput type="file" onChange={onLoadFile} />
          </IconButton>
          <UndoRedo></UndoRedo>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Dowser
          </Typography>
          <IconButton
            size="medium"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 0.5 }}
          >
            <DarkMode></DarkMode>
          </IconButton>
          <IconButton
            size="medium"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 0.5 }}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
