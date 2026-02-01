import { beforeEach, describe, it, expect } from "vitest";
import { makeUndoRedoStore } from "./undo-redo-store";
import type { Operation } from "../types/operation";

let store: ReturnType<typeof makeUndoRedoStore>;

const op = (title: string): Operation => ({
  title,
  bscan: [
    [1, 2],
    [3, 4],
  ],
});

describe("addOperation", () => {
  beforeEach(() => {
    store = makeUndoRedoStore();
  });
  it("adds revert operation to undoStack", () => {
    const s0 = store.getState();
    const bscan = op("1").bscan;

    const undoLen0 = s0.undoStack.length;
    // const redoLen0 = s0.redoStack.length;

    s0.addOperation(op("A"), bscan);

    const s1 = store.getState();
    expect(s1.undoStack.length).toBe(undoLen0 + 1);

    // We can’t know *exactly* what your revert operation looks like from the snippet,
    // but it must be an Operation-like object.
    const lastUndo = s1.undoStack.at(-1);
    expect(lastUndo).toBeTruthy();
    expect(typeof lastUndo!.title).toBe("string");
    expect(Array.isArray(lastUndo!.bscan)).toBe(true);

    // Optional stronger expectations (enable if it matches your implementation):
    // expect(lastUndo).not.toBe(s1.redoStack.at(-1)); // revert should differ from "do"
    // expect(lastUndo!.title).toMatch(/revert|undo/i);
    // expect(s1.redoStack.length).toBe(redoLen0 + 1); // sanity: history grew
  });

  it("adds operation to redoStack", () => {
    const operation = op("B");
    const s0 = store.getState();
    const redoLen0 = s0.redoStack.length;
    const bscan = op("1").bscan;

    s0.addOperation(operation, bscan);

    const s1 = store.getState();
    expect(s1.redoStack.length).toBe(redoLen0 + 1);

    const lastRedo = s1.redoStack.at(-1);
    // In most implementations this should be the same reference you passed in:
    expect(lastRedo).toBe(operation);
  });

  it("updates position", () => {
    const s0 = store.getState();
    const pos0 = s0.position;
    const bscan = op("1").bscan;

    s0.addOperation(op("C"), bscan);

    const s1 = store.getState();
    expect(s1.position).toBe(pos0 + 1);
  });

  it("clears stack after full undo and do smth else", () => {
    const s0 = store.getState();
    const initialPos = s0.position;
    const bscan = op("1").bscan;

    // add 3 operations
    s0.addOperation(op("1"), bscan);
    s0.addOperation(op("2"), bscan);
    s0.addOperation(op("3"), bscan);

    // undo everything to the beginning
    for (let i = 0; i < 3; i++) {
      store.getState().undo();
    }

    // After "full undo" we should be at (or before) the initial position.
    // Common case: back to -1.
    expect(store.getState().position).toBeLessThanOrEqual(initialPos);

    // Now add something new — should wipe the "future" redo history.
    store.getState().addOperation(op("NEW"), bscan);

    const sAfter = store.getState();

    // The timeline should now contain only what’s reachable from current position.
    // Common invariant: stacks are truncated to position+1.
    expect(sAfter.redoStack.length).toBe(sAfter.position);
    expect(sAfter.undoStack.length).toBe(sAfter.position);

    // And the last redo item should be NEW.
    expect(sAfter.redoStack.at(-1)?.title).toBe("NEW");

    // Optional: ensure old titles aren’t still hanging around in redoStack.
    const titles = sAfter.redoStack.map((x) => x.title);
    expect(titles).not.toContain("1");
    expect(titles).not.toContain("2");
    expect(titles).not.toContain("3");
  });
});
