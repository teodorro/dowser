import type { IOperation } from './data-processor';

export class CorrectZeroAmplitude implements IOperation {
  run = (data: number[][]): number[][] => {
    let processedData: number[][] = [];
    const max = Math.max(...data.map((x) => Math.max(...x)));
    if (max < 128) {
      processedData = this.convert128(data);
    } else if (max < 256) {
      processedData = this.convert256(data);
    } else if (max < 6000) {
      processedData = this.convert6000(data);
    } else if (max < 180000) {
      processedData = this.convert180000(data);
    } else throw new Error('Обработка формата файла не реализована');
    return processedData;
  };

  private convert128 = (data: number[][]): number[][] => {
    const zeroAmp = 64;
    data.forEach((ascan) =>
      ascan.forEach((val, ind) => {
        ascan[ind] = val - zeroAmp;
      })
    );
    return data;
  };

  private convert256 = (data: number[][]): number[][] => {
    const zeroAmp = 128;
    data.forEach((ascan) =>
      ascan.forEach((val, ind) => {
        ascan[ind] = val - zeroAmp;
      })
    );
    return data;
  };

  private convert6000 = (data: number[][]): number[][] => {
    const zeroAmp = 2515;
    data.forEach((ascan) =>
      ascan.forEach((val, ind) => {
        ascan[ind] = val - zeroAmp;
      })
    );
    return data;
  };

  private convert180000 = (data: number[][]): number[][] => {
    const zeroAmp = 88989;
    data.forEach((ascan) =>
      ascan.forEach((val, ind) => {
        ascan[ind] = val - zeroAmp;
      })
    );
    return data;
  };
}
