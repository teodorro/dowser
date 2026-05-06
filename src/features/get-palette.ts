import * as d3 from 'd3';

export const getPalette = (palette: string) => {
  switch (palette) {
    case 'greys':
      return makeLut256(d3.interpolateGreys);
    case 'viridis':
      return makeLut256(d3.interpolateViridis);
    case 'turbo':
      return makeLut256(d3.interpolateTurbo);
    case 'spectral':
      return makeLut256(d3.interpolateSpectral);
    case 'cubehelix':
      return makeLut256(d3.interpolateCubehelixDefault);
    case 'magma':
      return makeLut256(d3.interpolateMagma);
    case 'rainbow':
      return makeLut256(d3.interpolateRainbow);
    default:
      return makeLut256(d3.interpolateGreys);
  }
};

const makeLut256 = (interp: (t: number) => string): Uint8ClampedArray => {
  const lut = new Uint8ClampedArray(256 * 4);
  for (let i = 0; i < 256; i++) {
    const t = i / 255;
    const c = d3.rgb(interp(t));
    lut[i * 4 + 0] = c.r;
    lut[i * 4 + 1] = c.g;
    lut[i * 4 + 2] = c.b;
    lut[i * 4 + 3] = 255;
  }
  return lut;
};

export const getPaletteRaw = (palette: string): ((t: number) => string) => {
  switch (palette) {
    case 'greys':
      return d3.interpolateGreys;
    case 'viridis':
      return d3.interpolateViridis;
    case 'turbo':
      return d3.interpolateTurbo;
    case 'spectral':
      return d3.interpolateSpectral;
    case 'cubehelix':
      return d3.interpolateCubehelixDefault;
    case 'magma':
      return d3.interpolateMagma;
    case 'rainbow':
      return d3.interpolateRainbow;
    default:
      return d3.interpolateGreys;
  }
};

export default getPalette;
