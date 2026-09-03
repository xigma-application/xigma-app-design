// types
import { TDesignSnapshot } from 'store/design/types';
import { TVectorSelectionSnapshot } from 'types/design/canvas/types';

// utils
import { createHistoryStack, THistorySnapshot } from '../createHistoryStack';

const designSnapshot = (id: string): TDesignSnapshot => ({ activePageId: id, pages: {} });

const vectorSelectionSnapshot = (id: string): TVectorSelectionSnapshot => ({
  selectedVectorHandles: [],
  selectedVectorSegmentIds: [],
  selectedVectorVertexIds: [id],
});

const snapshot = (id: string): THistorySnapshot => ({ design: designSnapshot(id), vectorSelection: vectorSelectionSnapshot(id) });

describe('createHistoryStack', () => {
  it('should return null from undo when nothing was ever pushed', () => {
    // before
    const historyStack = createHistoryStack();

    // result
    expect(historyStack.undo(snapshot('current'))).toBeNull();
  });

  it('should report canUndo and canRedo as false on a fresh stack', () => {
    // before
    const historyStack = createHistoryStack();

    // result
    expect(historyStack.canUndo()).toBe(false);
    expect(historyStack.canRedo()).toBe(false);
  });

  it('should report canUndo once a snapshot is pushed and canRedo once one is undone', () => {
    // before
    const historyStack = createHistoryStack();

    historyStack.pushIfUndoable(snapshot('a'));

    // result — pushed but not yet undone
    expect(historyStack.canUndo()).toBe(true);
    expect(historyStack.canRedo()).toBe(false);

    // action
    historyStack.undo(snapshot('b'));

    // result — undone, so redo is now possible and the past is empty again
    expect(historyStack.canUndo()).toBe(false);
    expect(historyStack.canRedo()).toBe(true);
  });

  it('should return null from redo when nothing was ever undone', () => {
    // before
    const historyStack = createHistoryStack();

    // result
    expect(historyStack.redo(snapshot('current'))).toBeNull();
  });

  it('should undo to the last pushed snapshot and allow redo back to the current one', () => {
    // before
    const historyStack = createHistoryStack();

    historyStack.pushIfUndoable(snapshot('a'));

    // action
    const undone = historyStack.undo(snapshot('b'));

    // result
    expect(undone).toEqual(snapshot('a'));
    expect(historyStack.redo(snapshot('a'))).toEqual(snapshot('b'));
  });

  it('should clear the redo stack once a new snapshot is pushed', () => {
    // before
    const historyStack = createHistoryStack();

    historyStack.pushIfUndoable(snapshot('a'));
    historyStack.undo(snapshot('b'));
    historyStack.pushIfUndoable(snapshot('c'));

    // result
    expect(historyStack.redo(snapshot('c'))).toBeNull();
  });

  it('should notify subscribers when a push, undo, or redo changes the stack', () => {
    // before
    const historyStack = createHistoryStack();
    const listener = vi.fn();

    historyStack.subscribe(listener);

    // action
    historyStack.pushIfUndoable(snapshot('a'));

    // result
    expect(listener).toHaveBeenCalledTimes(1);

    // action
    historyStack.undo(snapshot('b'));

    // result
    expect(listener).toHaveBeenCalledTimes(2);

    // action
    historyStack.redo(snapshot('a'));

    // result
    expect(listener).toHaveBeenCalledTimes(3);
  });

  it('should stop notifying a subscriber once it unsubscribes', () => {
    // before
    const historyStack = createHistoryStack();
    const listener = vi.fn();
    const unsubscribe = historyStack.subscribe(listener);

    unsubscribe();

    // action
    historyStack.pushIfUndoable(snapshot('a'));

    // result
    expect(listener).not.toHaveBeenCalled();
  });

  it('should push only the gesture-start snapshot once for every undoable action inside a gesture', () => {
    // before
    const historyStack = createHistoryStack();

    historyStack.beginGesture(snapshot('gesture-start'));
    historyStack.pushIfUndoable(snapshot('mid-drag'));
    historyStack.pushIfUndoable(snapshot('mid-drag-2'));

    // result — undoing once returns straight to the gesture-start snapshot, not an intermediate one
    expect(historyStack.undo(snapshot('final'))).toEqual(snapshot('gesture-start'));
    expect(historyStack.undo(snapshot('gesture-start'))).toBeNull();
  });

  it('should resume pushing on every undoable action once the gesture ends', () => {
    // before
    const historyStack = createHistoryStack();

    historyStack.beginGesture(snapshot('gesture-start'));
    historyStack.pushIfUndoable(snapshot('mid-drag'));
    historyStack.endGesture();
    historyStack.pushIfUndoable(snapshot('after-gesture'));

    // result — two separate undo steps: the post-gesture push, then the gesture-start snapshot
    expect(historyStack.undo(snapshot('final'))).toEqual(snapshot('after-gesture'));
    expect(historyStack.undo(snapshot('after-gesture'))).toEqual(snapshot('gesture-start'));
  });
});
