import { Redo, Undo } from '@mui/icons-material';
import { Box, IconButton } from '@mui/material';
import { useEffect } from 'react';
import { useUndoRedoStore } from '../stores/undo-redo-store';
import { useShallow } from 'zustand/shallow';
import useBscanStore from '../stores/bscan-store';

export default function UndoRedo() {
  const {
    undo,
    redo,
    setUndoClicked,
    setRedoClicked,
    undoClicked,
    redoClicked,
    isUndoAvailable,
    isRedoAvailable,
  } = useUndoRedoStore(
    useShallow((s) => ({
      position: s.position,
      redoStack: s.redoStack,
      undo: s.undo,
      redo: s.redo,
      setUndoClicked: s.setUndoClicked,
      setRedoClicked: s.setRedoClicked,
      undoClicked: s.undoClicked,
      redoClicked: s.redoClicked,
      isUndoAvailable: s.isUndoAvailable,
      isRedoAvailable: s.isRedoAvailable,
    })),
  );

  const setBscan = useBscanStore.use.setBscan();

  useEffect(() => {
    if (undoClicked) {
      undoOperation();
      setUndoClicked(false);
    }
  }, [undoClicked]);

  useEffect(() => {
    if (redoClicked) {
      redoOperation();
      setRedoClicked(false);
    }
  }, [redoClicked]);

  const handleUndoClick = (): void => {
    setUndoClicked(true);
  };

  const handleRedoClick = (): void => {
    setRedoClicked(true);
  };

  const undoOperation = (): void => {
    setBscan(undo()!.bscan);
  };

  const redoOperation = (): void => {
    setBscan(redo()!.bscan);
  };

  return (
    <Box
      sx={{
        padding: 0,
        margin: 2,
        backgroundColor: 'transparent',
      }}
    >
      <IconButton
        color="inherit"
        aria-label="menu"
        edge="start"
        size="large"
        disabled={isUndoAvailable() === false}
        onClick={handleUndoClick}
        sx={{
          padding: 0,
          minWidth: 'auto',
          width: 'auto',
          height: 'auto',
          lineHeight: 0,
          borderRadius: 3,
          mr: 0.5,
        }}
      >
        <Undo />
      </IconButton>
      <IconButton
        color="inherit"
        aria-label="menu"
        edge="start"
        size="medium"
        disabled={isRedoAvailable() === false}
        onClick={handleRedoClick}
        sx={{
          padding: 0,
          marginLeft: '0.35em',
          minWidth: 'auto',
          width: 'auto',
          height: 'auto',
          lineHeight: 0,
          borderRadius: 3,
          mr: '-0.5em',
        }}
      >
        <Redo />
      </IconButton>
    </Box>
  );
}
