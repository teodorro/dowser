import { Box } from '@mui/material';
import React, { useEffect, useRef } from 'react';
import type { Nullable } from '../types/utility-types';
import { showError } from '../utils/show-error';
import useVisualSettingsStore from '../stores/visual-settings-store';
import { getPaletteRaw } from './get-palette';
import useUiStore from '../stores/ui-store';

export default function Palette() {
  const canvasRef = useRef<Nullable<HTMLCanvasElement>>(null);
  const redrawRef = useRef<() => void>(() => {});

  const selectedPalette = useVisualSettingsStore.use.selectedPalette();
  const selectedPaletteSpectrum =
    useVisualSettingsStore.use.selectedPaletteSpectrum();
  const selectedPaletteAttributes =
    useVisualSettingsStore.use.selectedPaletteAttributes();

  const fftMode = useUiStore.use.fftMode();
  const attributesMode = useUiStore.use.attributesMode();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ro = new ResizeObserver(() => {
      requestAnimationFrame(() => redrawRef.current());
    });
    ro.observe(canvas);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    redrawRef.current();
  }, [
    selectedPalette,
    selectedPaletteSpectrum,
    selectedPaletteAttributes,
    fftMode,
    attributesMode,
  ]);

  redrawRef.current = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      showError('Canvas 2D context not available');
      return;
    }

    const gradient = ctx.createLinearGradient(0, 0, 300, 0);

    const steps = 300;

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const color = getPaletteRaw(
        fftMode
          ? selectedPaletteSpectrum
          : attributesMode
            ? selectedPaletteAttributes
            : selectedPalette,
      )(t);
      gradient.addColorStop(t, color);
    }

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 300, 100);
  };

  return (
    <Box
      sx={{
        width: '100%',
        height: '2em',
        bottom: 0,
        px: 1,
        borderLeft: '1px solid #444',
      }}
    >
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
    </Box>
  );
}
