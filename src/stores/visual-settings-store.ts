import { create } from "zustand";
import { createSelectors } from "../utils/create-selectors";

interface IVisualSettingsStore {
  logAmplitudeSelected: boolean;

  setLogAmplitudeSelected: (selected: boolean) => void;
}

const useVisualSettingsStoreBase = create<IVisualSettingsStore>((set) => ({
  logAmplitudeSelected: true,

  setLogAmplitudeSelected: (selected: boolean) =>
    set(() => ({ logAmplitudeSelected: selected })),
}));

const useVisualSettingsStore = createSelectors(useVisualSettingsStoreBase);

export default useVisualSettingsStore;
