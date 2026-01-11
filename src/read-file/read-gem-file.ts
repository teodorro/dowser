import { convertInd2Amp } from './convert-ind-2-amp';

export const readGemFile = (raw: Uint8Array): number[][] => {
  const bscanLengthArray = Array.from(raw.slice(16, 18));
  const bscanLength = bscanLengthArray[1] + bscanLengthArray[0] * 256;
  const bscan: number[][] = [];

  const ascanLength = 512 + 112;
  const ascanDataLength = 512;
  for (let i = 0; i < bscanLength; i++) {
    const ascan = raw.slice(
      514 + i * ascanLength,
      514 + i * ascanLength + ascanDataLength
    );
    bscan.push(Array.from(ascan));
  }

  // To check values if needed
  // const x = bscan.flat();
  // const y = new Set(x);
  // const z = [...y].sort((a, b) => a - b);
  // const maxValue = Math.max(...bscan.map((x) => Math.max(...x)));

  getRidOfTwoStepKrotFormat(bscan);
  convertIndicesToAmplitudes(bscan);

  return bscan;
};

const getRidOfTwoStepKrotFormat = (bscan: number[][]) => {
  bscan.forEach((ascan) => {
    for (let i = 0; i < ascan.length; i++) {
      ascan[i] = Math.max(Math.round(ascan[i] / 2 - 1), 0);
    }
  });
};

const convertIndicesToAmplitudes = (bscan: number[][]) => {
  bscan.forEach((ascan) => {
    for (let i = 0; i < ascan.length; i++) {
      ascan[i] = convertInd2Amp(ascan[i]);
    }
  });
};
