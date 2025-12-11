export const readGemFile = (raw: Uint8Array): number[][] => {
  const bscanLengthArray = Array.from(raw.slice(16, 18));
  const bscanLength = bscanLengthArray[1] + bscanLengthArray[0] * 8;
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
  // const x = bscan.flat();
  // const y = new Set(x);
  // const z = [...y].sort((a, b) => a - b);
  return bscan;
};
