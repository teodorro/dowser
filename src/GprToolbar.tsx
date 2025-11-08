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
import { readKrotTxtFile } from './read-file/read-krot-txt-file';
import useBscanStore from './stores/bscan-store';

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
  const bscanStore = useBscanStore();

  const onLoadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files == null || files.length === 0) return;
    const file = files[0];
    console.log(file);
    try {
      if (file.size > 5 * 1024 * 1024) {
        console.warn('File is large; consider streaming.');
      }

      const raw = await file.text(); // <-- simplest way
      const krotdata = readKrotTxtFile(raw);
      bscanStore.setBscan(krotdata);
    } catch (err) {
      console.error('Failed to read file:', err);
    } finally {
      e.target.value = ''; // allow re-selecting the same file later
    }
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
