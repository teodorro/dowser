import useBscanStore from "../stores/bscan-store";
import useUiStore from "../stores/ui-store";
import { readGemFile } from "./read-gem-file";
import { readGeoFile } from "./read-geo-file";
import { readKrotTxtFile } from "./read-krot-txt-file";

export const loadDataFile = (file: File) => {
  const extension = file.name.split(".")[file.name.split(".").length - 1];
  console.log(file);
  switch (extension) {
    case "txt":
      loadTxtFile(file);
      break;
    case "geo":
      loadGeoFile(file);
      break;
    case "gem":
      loadGemFile(file);
      break;
    default:
      unreachable(extension);
  }
};

const unreachable = (extension: string): never => {
  throw new Error(`Обработка расширения файла "${extension}" не реализована`);
};

const loadTxtFile = async (file: File) => {
  try {
    if (file.size > 5 * 1024 * 1024) {
      console.warn("File is large; consider streaming.");
    }

    const raw = await file.text();
    const krotdata = readKrotTxtFile(raw);
    useBscanStore.getState().setBscanFullAmp(krotdata);
    useUiStore.getState().setFilename(file.name);
  } catch (err) {
    console.error("Failed to read file:", err);
  }
};

const loadGeoFile = async (file: File) => {
  const reader = new FileReader();

  reader.onload = () => {
    const buffer = reader.result as ArrayBuffer; // FileReader gives ArrayBuffer here
    const uint8 = new Uint8Array(buffer);
    const data = readGeoFile(uint8);
    useBscanStore.getState().setBscanFullAmp(data);
    useUiStore.getState().setFilename(file.name);
  };

  reader.onerror = () => {
    // setError('Failed to read file');
    useBscanStore.getState().setBscanFullAmp([]);
  };

  reader.readAsArrayBuffer(file);
};

const loadGemFile = async (file: File) => {
  const reader = new FileReader();

  reader.onload = () => {
    const buffer = reader.result as ArrayBuffer; // FileReader gives ArrayBuffer here
    const uint8 = new Uint8Array(buffer);
    const data = readGemFile(uint8);
    useBscanStore.getState().setBscanFullAmp(data);
    useUiStore.getState().setFilename(file.name);
  };

  reader.onerror = () => {
    // setError('Failed to read file');
    useBscanStore.getState().setBscanFullAmp([]);
  };

  reader.readAsArrayBuffer(file);
};
