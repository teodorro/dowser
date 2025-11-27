export const readGeoFile = (raw: Uint8Array): number[][] => {
  const bscanLengthArray = Array.from(raw.slice(13, 16));
  const bscanLength =
    bscanLengthArray[2] + bscanLengthArray[1] * 8 + bscanLengthArray[0] * 64;
  const ascanHeaderPart = new Uint8Array([0xa1, 0x00]);
  const indices: number[] = [];
  const bscan: number[][] = [];

  console.log(bscanLength);
  for (let i = 16; i < raw.length - 2; i++) {
    if (raw[i] === ascanHeaderPart[0] && raw[i + 1] === ascanHeaderPart[1])
      indices.push(i);
  }
  const ascanDataAndHeaderLength =
    indices.length > 1 ? indices[1] - indices[0] : raw.length - indices[0];
  let ascanHeaderLength = 0;
  let ascanDataLength = 0;
  if (ascanDataAndHeaderLength === 267) {
    ascanHeaderLength = 10;
    ascanDataLength = 256;
  } else if (ascanDataAndHeaderLength === 523) {
    ascanHeaderLength = 10;
    ascanDataLength = 512;
  } else if (ascanDataAndHeaderLength === 270) {
    ascanHeaderLength = 13;
    ascanDataLength = 256;
  } else if (ascanDataAndHeaderLength === 526) {
    ascanHeaderLength = 13;
    ascanDataLength = 512;
  } else {
    throw new Error('Ошибка чтения файла');
  }

  indices.forEach((index) => {
    const ascan = raw.slice(
      index + ascanHeaderLength,
      index + ascanHeaderLength + ascanDataLength
    );
    bscan.push(Array.from(ascan));
  });
  return bscan;
};
