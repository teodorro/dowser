import { create } from 'zustand';
import { createSelectors } from '../utils/create-selectors';

interface IErrorStore {
  message: string;
  error: unknown;
  isErrorShown: boolean;
  setError: (msg: string, err: unknown) => void;
  setErrorShown: (happened: boolean) => void;
}

const useErrorStoreBase = create<IErrorStore>((set) => ({
  message: '',
  error: null,
  isErrorShown: false,
  setError: (msg, err) =>
    set(() => ({
      message: msg,
      error: err,
    })),
  setErrorShown: (happened: boolean) =>
    set(() => ({
      isErrorShown: happened,
    })),
}));

const useErrorStore = createSelectors(useErrorStoreBase);

export default useErrorStore;
