import { Box, IconButton, Menu, MenuItem, Typography } from '@mui/material';
import React from 'react';
import DataSettings from './DataSettings';
import VisualSettings from './VisualSettings';
import ProcessingSettings from './ProcessingSettings';
import { Menu as MenuIcon } from '@mui/icons-material';

export default function Settings() {
  const SIZES = 'Размеры';
  const PROCESSING = 'Обработка данных';
  const VISUAL = 'Визуальные настройки';

  const [activeTab, setActiveTab] = React.useState<string>(SIZES);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSizesClose = () => {
    setActiveTab(SIZES);
    setAnchorEl(null);
  };

  const handleProcessingClose = () => {
    setActiveTab(PROCESSING);
    setAnchorEl(null);
  };

  const handleVisualClose = () => {
    setActiveTab(VISUAL);
    setAnchorEl(null);
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
          {activeTab}
        </Typography>
      </Box>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        slotProps={{
          list: {
            'aria-labelledby': 'basic-button',
          },
        }}
      >
        <MenuItem onClick={handleSizesClose}>{SIZES}</MenuItem>
        <MenuItem onClick={handleProcessingClose}>{PROCESSING}</MenuItem>
        <MenuItem onClick={handleVisualClose}>{VISUAL}</MenuItem>
      </Menu>
      {activeTab === SIZES && <DataSettings></DataSettings>}
      {activeTab === PROCESSING && <ProcessingSettings></ProcessingSettings>}
      {activeTab === VISUAL && <VisualSettings></VisualSettings>}
    </Box>
  );
}
