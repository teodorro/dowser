import { create } from "zustand";
import { createSelectors } from "../utils/create-selectors";

interface IUiStore {
  ascanHidden: boolean;

  setAscanHidden: (hidden: boolean) => void;
}

const useUiStoreBase = create<IUiStore>((set) => ({
  ascanHidden: false,

  setAscanHidden: (hidden: boolean) => set(() => ({ ascanHidden: hidden })),
}));

const useUiStore = createSelectors(useUiStoreBase);

export default useUiStore;
