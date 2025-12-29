import {
  AppBar,
  Box,
  IconButton,
  styled,
  Toolbar,
  Typography,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { DarkMode, FolderOpen } from '@mui/icons-material';
import { readKrotTxtFile } from '../read-file/read-krot-txt-file';
import useBscanStore from '../stores/bscan-store';
import { readGeoFile } from '../read-file/read-geo-file';
import { readGemFile } from '../read-file/read-gem-file';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

export default function GprToolbar() {
  const setFullAmpBscan = useBscanStore.use.setFullAmpBscan();

  const onLoadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files == null || files.length === 0) return;
    const file = files[0];
    if (!file) return;
    const extension = file.name.split('.')[file.name.split('.').length - 1];
    console.log(file);
    switch (extension) {
      case 'txt':
        loadTxtFile(file);
        break;
      case 'geo':
        loadGeoFile(file);
        break;
      case 'gem':
        loadGemFile(file);
        break;
      default:
        break;
    }
  };

  const loadTxtFile = async (file: File) => {
    try {
      if (file.size > 5 * 1024 * 1024) {
        console.warn('File is large; consider streaming.');
      }

      const raw = await file.text();
      const krotdata = readKrotTxtFile(raw);
      setFullAmpBscan(krotdata);
    } catch (err) {
      console.error('Failed to read file:', err);
    }
  };

  const loadGeoFile = async (file: File) => {
    const reader = new FileReader();

    reader.onload = () => {
      const buffer = reader.result as ArrayBuffer; // FileReader gives ArrayBuffer here
      const uint8 = new Uint8Array(buffer);
      const data = readGeoFile(uint8);
      setFullAmpBscan(data);
    };

    reader.onerror = () => {
      // setError('Failed to read file');
      setFullAmpBscan([]);
    };

    reader.readAsArrayBuffer(file);
  };

  const loadGemFile = async (file: File) => {
    const reader = new FileReader();

    reader.onload = () => {
      const buffer = reader.result as ArrayBuffer; // FileReader gives ArrayBuffer here
      const uint8 = new Uint8Array(buffer);
      const data = readGemFile(uint8);
      setFullAmpBscan(data);
    };

    reader.onerror = () => {
      // setError('Failed to read file');
      setFullAmpBscan([]);
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            component="label"
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <FolderOpen></FolderOpen>
            <VisuallyHiddenInput type="file" onChange={onLoadFile} />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Dowser
          </Typography>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <DarkMode></DarkMode>
          </IconButton>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
