import { Box, IconButton, Menu, MenuItem, Typography } from '@mui/material';
import React, { useState } from 'react';
import DataSettings from './tabs/DataSettings';
import VisualSettings from './tabs/VisualSettings';
import ProcessingSettings from './tabs/ProcessingSettings';
import SpectrumSettings from './tabs/SpectrumSettings';
import { Menu as MenuIcon } from '@mui/icons-material';
import useUiStore from '../stores/ui-store';
import { getFftBscan } from '../processing/data-processing/fft-bscan';
import useBscanStore from '../stores/bscan-store';
import TabType from '../types/tab-type';

export default function Settings() {
  const SIZES = 'Размеры';
  const PROCESSING = 'Обработка данных';
  const SPECTRUM = 'Спектр';
  const VISUAL = 'Визуальные настройки';

  const setFftMode = useUiStore.use.setFftMode();
  const fftMode = useUiStore.use.fftMode();

  const bscan = useBscanStore.use.bscan();
  const setBscanFft = useBscanStore.use.setBscanFft();

  const activeTab = useUiStore.use.activeTab();
  const setActiveTab = useUiStore.use.setActiveTab();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSizesClose = () => {
    setActiveTab(TabType.SIZES);
    setAnchorEl(null);
    if (fftMode) {
      setFftMode(false);
    }
  };

  const handleProcessingClose = () => {
    setActiveTab(TabType.PROCESSING);
    setAnchorEl(null);
    if (fftMode) {
      setFftMode(false);
    }
  };

  const handleSpectrumClose = () => {
    setActiveTab(TabType.SPECTRUM);
    setAnchorEl(null);
    if (!fftMode) {
      setFftMode(true);
      setBscanFft(getFftBscan(bscan).bscan);
    }
  };

  const handleVisualClose = () => {
    setActiveTab(TabType.VISUAL);
    setAnchorEl(null);
  };

  const getTabName = (tab: TabType): string => {
    switch (tab) {
      case TabType.SIZES:
        return 'Размеры';
      case TabType.PROCESSING:
        return 'Обработка данных';
      case TabType.SPECTRUM:
        return 'Спектр';
      case TabType.VISUAL:
        return 'Визуальные настройки';
      default:
        return '';
    }
  };

  return (
    <Box
      sx={{
        width: '20em',
        flexShrink: 0,
        height: '100%',
        background: '#eee',
        color: '#888',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'center',
          py: '0.25em',
          px: '1em',
          width: '100%',
          background: '#fafafa',
          color: 'primary.main',
          borderBottom: '1px solid #888',
          marginBottom: '1em',
          boxShadow: '0 0 10px 0 rgba(0, 0, 0, 0.25)',
        }}
      >
        <IconButton
          size="medium"
          edge="start"
          aria-label="menu"
          sx={{ mr: 0.5 }}
          onClick={handleClick}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="button" component="div" sx={{ flexGrow: 1 }}>
          {getTabName(activeTab)}
        </Typography>
      </Box>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        disableScrollLock
        slotProps={{
          list: {
            'aria-labelledby': 'basic-button',
          },
        }}
      >
        <MenuItem onClick={handleSizesClose}>{SIZES}</MenuItem>
        <MenuItem onClick={handleProcessingClose}>{PROCESSING}</MenuItem>
        <MenuItem onClick={handleSpectrumClose}>{SPECTRUM}</MenuItem>
        <MenuItem onClick={handleVisualClose}>{VISUAL}</MenuItem>
      </Menu>
      {activeTab === TabType.SIZES && <DataSettings></DataSettings>}
      {activeTab === TabType.PROCESSING && (
        <ProcessingSettings></ProcessingSettings>
      )}
      {activeTab === TabType.SPECTRUM && <SpectrumSettings></SpectrumSettings>}
      {activeTab === TabType.VISUAL && <VisualSettings></VisualSettings>}
    </Box>
  );
}
