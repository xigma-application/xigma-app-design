// store
import { updateNode } from 'store/design/slice';
import { store } from 'store';

// types
import { LayoutMode } from 'types/design/enums';

// utils
import { addChildren, addFrame, addRoot, makeManualGrid, readAnchor, readChildIds, resetPage } from './multiParentFixtures';
import { applyDeferredSlotDelta } from '../applyDeferredSlotDelta';

describe('applyDeferredSlotDelta', () => {
  beforeEach(resetPage);

  it('should move a vertical-list group down by the given number of steps', () => {
    // mock
    const frame = addFrame(LayoutMode.vertical, 0, 0);
    const [a, b, c] = addChildren(frame, 3);

    // action
    applyDeferredSlotDelta(store.dispatch, [a], { steps: 1, x: 0, y: 1 });

    // result
    expect(readChildIds(frame)).toEqual([b, a, c]);
  });

  it('should read the horizontal axis of a horizontal list when the delta is not linear', () => {
    // mock
    const frame = addFrame(LayoutMode.horizontal, 0, 0);
    const [a, b, c] = addChildren(frame, 3);

    // action
    applyDeferredSlotDelta(store.dispatch, [a], { steps: null, x: 2, y: 0 });

    // result
    expect(readChildIds(frame)).toEqual([b, c, a]);
  });

  it('should read the vertical axis of a vertical list when the delta is not linear', () => {
    // mock
    const frame = addFrame(LayoutMode.vertical, 0, 0);
    const [a, b, c] = addChildren(frame, 3);

    // action
    applyDeferredSlotDelta(store.dispatch, [a], { steps: null, x: 0, y: 1 });

    // result
    expect(readChildIds(frame)).toEqual([b, a, c]);
  });

  it('should clamp to the end of the list and to the start of the list', () => {
    // mock
    const frame = addFrame(LayoutMode.vertical, 0, 0);
    const [a, b, c] = addChildren(frame, 3);

    // action
    applyDeferredSlotDelta(store.dispatch, [a], { steps: 9, x: 0, y: 9 });
    applyDeferredSlotDelta(store.dispatch, [a], { steps: -9, x: 0, y: -9 });

    // result
    expect(readChildIds(frame)).toEqual([a, b, c]);
  });

  it('should leave the list alone for a zero-step delta', () => {
    // mock
    const frame = addFrame(LayoutMode.vertical, 0, 0);
    const [a, b, c] = addChildren(frame, 3);

    // action
    applyDeferredSlotDelta(store.dispatch, [b], { steps: 0, x: 0, y: 0 });

    // result
    expect(readChildIds(frame)).toEqual([a, b, c]);
  });

  it('should move a manually placed grid child by the given number of cells', () => {
    // mock
    const frame = addFrame(LayoutMode.grid, 0, 0);
    const [a] = addChildren(frame, 1);

    makeManualGrid(frame, [{ childId: a, column: 0, row: 0 }]);

    // action
    applyDeferredSlotDelta(store.dispatch, [a], { steps: null, x: 1, y: 2 });

    // result
    expect(readAnchor(a)).toEqual({ column: 1, row: 2 });
  });

  it('should clamp the column into the grid and the row above zero', () => {
    // mock
    const frame = addFrame(LayoutMode.grid, 0, 0);
    const [a] = addChildren(frame, 1);

    makeManualGrid(frame, [{ childId: a, column: 1, row: 1 }]);

    // action
    applyDeferredSlotDelta(store.dispatch, [a], { steps: null, x: 9, y: -9 });

    // result
    expect(readAnchor(a)).toEqual({ column: 2, row: 0 });
  });

  it('should not move a grid child onto a cell another child occupies', () => {
    // mock
    const frame = addFrame(LayoutMode.grid, 0, 0);
    const [a, b] = addChildren(frame, 2);

    makeManualGrid(frame, [
      { childId: a, column: 0, row: 0 },
      { childId: b, column: 1, row: 0 },
    ]);

    // action
    applyDeferredSlotDelta(store.dispatch, [a], { steps: null, x: 1, y: 0 });

    // result
    expect(readAnchor(a)).toEqual({ column: 0, row: 0 });
  });

  it('should not touch a grid child when the shift lands on its own cell', () => {
    // mock
    const frame = addFrame(LayoutMode.grid, 0, 0);
    const [a] = addChildren(frame, 1);

    makeManualGrid(frame, [{ childId: a, column: 2, row: 0 }]);

    // action
    applyDeferredSlotDelta(store.dispatch, [a], { steps: null, x: 3, y: 0 });

    // result
    expect(readAnchor(a)).toEqual({ column: 2, row: 0 });
  });

  it('should leave a grid on automatic positioning alone, since its cells own the children', () => {
    // mock
    const frame = addFrame(LayoutMode.grid, 0, 0);
    const [a] = addChildren(frame, 1);

    // action
    applyDeferredSlotDelta(store.dispatch, [a], { steps: null, x: 1, y: 1 });

    // result
    expect(readAnchor(a)).toEqual({ column: undefined, row: undefined });
  });

  it('should do nothing for a node that is not in an auto-layout or grid parent', () => {
    // mock
    const id = addRoot(10, 10);

    // action
    applyDeferredSlotDelta(store.dispatch, [id], { steps: 1, x: 1, y: 1 });

    // result
    expect(readAnchor(id)).toEqual({ column: undefined, row: undefined });
  });

  it('should do nothing for a grid child that is absolutely positioned and so has no cell', () => {
    // mock
    const frame = addFrame(LayoutMode.grid, 0, 0);
    const [a] = addChildren(frame, 1);

    makeManualGrid(frame, []);
    store.dispatch(updateNode({ changes: { ignoreAutoLayout: true }, id: a }));

    // action
    applyDeferredSlotDelta(store.dispatch, [a], { steps: null, x: 1, y: 1 });

    // result
    expect(readAnchor(a)).toEqual({ column: undefined, row: undefined });
  });
});
