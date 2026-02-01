import { create, useStore } from "zustand";
import type { Operation } from "../types/operation";

export interface IUndoRedoStore {
  undoStack: Operation[];
  redoStack: Operation[];
  position: number;
  undoClicked: boolean;
  redoClicked: boolean;

  addOperation: (operation: Operation, currentBscan: number[][]) => void;
  undo: () => Operation | null;
  redo: () => Operation | null;
  clearUndoRedo: () => void;
  isUndoAvailable: () => boolean;
  isRedoAvailable: () => boolean;
  setUndoClicked: (val: boolean) => void;
  setRedoClicked: (val: boolean) => void;
}

export const makeUndoRedoStore = () =>
  create<IUndoRedoStore>((set, get) => ({
    undoStack: [],
    redoStack: [],
    position: 0,
    undoClicked: false,
    redoClicked: false,

    addOperation: (operation: Operation, currentBscan: number[][]) =>
      set(() => {
        const { undoStack, redoStack, position } = get();
        const newUndoStack = undoStack.slice(0, position).concat({
          title: operation.title + " (revert)",
          bscan: currentBscan,
        });
        const newRedoStack = redoStack.slice(0, position).concat(operation);
        return {
          undoStack: newUndoStack,
          redoStack: newRedoStack,
          position: position + 1,
        };
      }),

    undo: () => {
      const { undoStack, position } = get();
      if (position === 0)
        throw new Error("Attempt to undo with empty undo stack");
      set({ position: position - 1 });
      return undoStack[position - 1];
    },

    redo: () => {
      const { position, redoStack } = get();
      if (position === redoStack.length)
        throw new Error("Attempt to redo beyond redo stack");
      set({ position: position + 1 });
      return redoStack[position];
    },

    clearUndoRedo: () =>
      set(() => ({
        undoStack: [],
        redoStack: [],
        position: 0,
      })),

    isUndoAvailable: (): boolean => {
      const { position } = get();
      return position > 0;
    },

    isRedoAvailable: (): boolean => {
      const { position, redoStack } = get();
      return position < redoStack.length;
    },

    setUndoClicked: (val: boolean) => {
      set(() => ({ undoClicked: val }));
    },

    setRedoClicked: (val: boolean) => {
      set(() => ({ redoClicked: val }));
    },
  }));

export const undoRedoStore = makeUndoRedoStore();

// Do not change to const = =>
export function useUndoRedoStore<T>(selector: (s: IUndoRedoStore) => T) {
  return useStore(undoRedoStore, selector);
}
