import { create } from "zustand";
import { createSelectors } from "../utils/create-selectors";

interface IUiStore {
  filename: string;
  ascanHidden: boolean;

  setFilename: (filename: string) => void;
  setAscanHidden: (hidden: boolean) => void;
}

const useUiStoreBase = create<IUiStore>((set) => ({
  filename: "Dowser",
  ascanHidden: false,

  setFilename: (filename: string) => set(() => ({ filename })),
  setAscanHidden: (hidden: boolean) => set(() => ({ ascanHidden: hidden })),
}));

const useUiStore = createSelectors(useUiStoreBase);

export default useUiStore;
