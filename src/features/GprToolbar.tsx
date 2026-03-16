import {
  AppBar,
  Box,
  IconButton,
  Menu,
  MenuItem,
  styled,
  Toolbar,
  Typography,
} from '@mui/material';
import {
  FolderOpen,
  Loupe,
  Palette,
  WidthNormal,
  WidthWide,
} from '@mui/icons-material';
import UndoRedo from './UndoRedo';
import { loadDataFile } from '../read-file/load-data-file';
import useUiStore from '../stores/ui-store';
import { useUndoRedoStore } from '../stores/undo-redo-store';
import { useShallow } from 'zustand/shallow';
import { showError } from '../utils/show-error';
import { useEffect, useState } from 'react';
import useBscanStore from '../stores/bscan-store';
import TabType from '../types/tab-type';
import useVisualSettingsStore from '../stores/visual-settings-store';

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
  const paletteOptions = [
    { value: 'greys', label: 'Greys' },
    { value: 'viridis', label: 'Viridis' },
    { value: 'turbo', label: 'Turbo' },
    { value: 'spectral', label: 'Spectral' },
    { value: 'cubehelix', label: 'Cubehelix' },
    { value: 'magma', label: 'Magma' },
    { value: 'rainbow', label: 'Rainbow' },
  ];

  const ascanHidden = useUiStore.use.ascanHidden();
  const filename = useUiStore.use.filename();

  const fftMode = useUiStore.use.fftMode();
  const attributesMode = useUiStore.use.attributesMode();
  const setFftMode = useUiStore.use.setFftMode();
  const setAscanHidden = useUiStore.use.setAscanHidden();
  const setActiveTab = useUiStore.use.setActiveTab();

  const bscanFullAmp = useBscanStore.use.bscanFullAmp();
  const setBscan = useBscanStore.use.setBscan();

  const selectedPalette = useVisualSettingsStore.use.selectedPalette();
  const selectedPaletteSpectrum =
    useVisualSettingsStore.use.selectedPaletteSpectrum();
  const selectedPaletteAttributes =
    useVisualSettingsStore.use.selectedPaletteAttributes();
  const setSelectedPalette = useVisualSettingsStore.use.setSelectedPalette();
  const setSelectedPaletteSpectrum =
    useVisualSettingsStore.use.setSelectedPaletteSpectrum();
  const setSelectedPaletteAttributes =
    useVisualSettingsStore.use.setSelectedPaletteAttributes();
  const setLogAmplitudeSelected2 =
    useVisualSettingsStore.use.setLogAmplitudeSelected2();
  const logAmplitudeSelected2 =
    useVisualSettingsStore.use.logAmplitudeSelected2();

  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  const { clearUndoRedo } = useUndoRedoStore(
    useShallow((s) => ({
      clearUndoRedo: s.clearUndoRedo,
    })),
  );

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  useEffect(() => {
    clearUndoRedo();
    setBscan(bscanFullAmp);
    setFftMode(false);
    setActiveTab(TabType.SIZES);
  }, [bscanFullAmp]);

  useEffect(() => {
    if (attributesMode) {
      setSelectedIndex(
        paletteOptions.findIndex((p) => p.value === selectedPaletteAttributes),
      );
    } else if (fftMode) {
      setSelectedIndex(
        paletteOptions.findIndex((p) => p.value === selectedPaletteSpectrum),
      );
    } else {
      setSelectedIndex(
        paletteOptions.findIndex((p) => p.value === selectedPalette),
      );
    }
  }, [
    fftMode,
    attributesMode,
    selectedPalette,
    selectedPaletteAttributes,
    selectedPaletteSpectrum,
  ]);

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

  const handlePaletteButtonClick = (
    event: React.MouseEvent<HTMLLabelElement, MouseEvent>,
  ) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuPaletteItemClick = (index: number) => {
    setSelectedIndex(index);
    if (attributesMode) {
      setSelectedPaletteAttributes(paletteOptions[index].value);
    } else if (fftMode) {
      setSelectedPaletteSpectrum(paletteOptions[index].value);
    } else {
      setSelectedPalette(paletteOptions[index].value);
    }
    setAnchorEl(null);
  };

  const handleMenuPaletteClose = () => {
    setAnchorEl(null);
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
            size="small"
            edge="start"
            color="inherit"
            aria-label="open file"
            sx={{ m: '0.1em' }}
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

          <IconButton
            component="label"
            size="small"
            edge="start"
            color="inherit"
            aria-label="palette"
            sx={{ m: '0.1em' }}
            onClick={(event) => handlePaletteButtonClick(event)}
          >
            <Palette></Palette>
          </IconButton>
          <Menu
            id="palette-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={handleMenuPaletteClose}
            slotProps={{
              list: {
                'aria-labelledby': 'palette-button',
                role: 'listbox',
              },
            }}
          >
            {paletteOptions.map((option, index) => (
              <MenuItem
                key={option.value}
                selected={index === selectedIndex}
                onClick={() => handleMenuPaletteItemClick(index)}
              >
                {option.label}
              </MenuItem>
            ))}
          </Menu>

          {!fftMode && !attributesMode && (
            <IconButton
              component="label"
              size="small"
              edge="start"
              color="inherit"
              aria-label="logarithm"
              sx={{
                m: '0.1em',
                border: logAmplitudeSelected2
                  ? '2px solid #fff'
                  : '2px solid #ffffff00',
              }}
              onClick={() => setLogAmplitudeSelected2(!logAmplitudeSelected2)}
            >
              <Loupe></Loupe>
            </IconButton>
          )}
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {filename}
          </Typography>

          <IconButton
            size="medium"
            edge="start"
            color="inherit"
            aria-label="ascan"
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
