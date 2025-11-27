import useBscanStore from '../stores/bscan-store';

export interface IDataProcessor {
  process: () => void;
  operations: IOperation[];
}

export interface IOperation {
  run: (data: number[][]) => number[][];
}

export class DataProcessor implements IDataProcessor {
  operations: IOperation[] = [];

  process = (): void => {
    let data = useBscanStore.getState().bscan;
    this.operations.forEach((operation) => {
      data = operation.run(data);
    });
    useBscanStore.getState().setBscan(data);
  };
}
