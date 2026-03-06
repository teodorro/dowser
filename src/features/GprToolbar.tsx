import {
  AppBar,
  Box,
  IconButton,
  styled,
  Toolbar,
  Typography,
} from '@mui/material';
import { FolderOpen, WidthNormal, WidthWide } from '@mui/icons-material';
import UndoRedo from './UndoRedo';
import { loadDataFile } from '../read-file/load-data-file';
import useUiStore from '../stores/ui-store';
import { useUndoRedoStore } from '../stores/undo-redo-store';
import { useShallow } from 'zustand/shallow';
import { showError } from '../utils/show-error';
import { useEffect } from 'react';
import useBscanStore from '../stores/bscan-store';

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
  const ascanHidden = useUiStore.use.ascanHidden();
  const setAscanHidden = useUiStore.use.setAscanHidden();
  const filename = useUiStore.use.filename();

  const bscanFullAmp = useBscanStore.use.bscanFullAmp();

  const { clearUndoRedo } = useUndoRedoStore(
    useShallow((s) => ({
      clearUndoRedo: s.clearUndoRedo,
    })),
  );

  useEffect(() => {
    clearUndoRedo();
  }, [bscanFullAmp]);

  const onLoadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files == null || files.length === 0) return;
    const file = files[0];
    if (!file) return;
    try {
      loadDataFile(file);
    } catch (err) {
      showError(`Ошибка при загрузке файла: ${(err as Error).message}`);
    }
  };

  return (
    <Box sx={{ flexGrow: 1, height: '3em' }}>
      <AppBar position="static" sx={{ height: '3em' }}>
        <Toolbar
          variant="dense"
          disableGutters
          sx={{
            height: '3em',
            minHeight: '3em', // <-- the important part
            px: 1, // add your own padding since gutters are off
            alignItems: 'center', // usually already true, but explicit is fine
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
            <VisuallyHiddenInput
              type="file"
              onChange={onLoadFile}
              onClick={(e) => {
                (e.currentTarget as HTMLInputElement).value = ''; // allow re-uploading the same file
              }}
            />
          </IconButton>
          <UndoRedo></UndoRedo>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {filename}
          </Typography>
          <IconButton
            size="medium"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 0.5 }}
            onClick={() => setAscanHidden(!ascanHidden)}
          >
            {ascanHidden ? (
              <WidthNormal></WidthNormal>
            ) : (
              <WidthWide></WidthWide>
            )}
          </IconButton>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
