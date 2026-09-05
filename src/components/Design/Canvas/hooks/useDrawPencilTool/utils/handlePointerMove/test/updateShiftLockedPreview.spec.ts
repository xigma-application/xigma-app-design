// types
import { TPencilDragRefs } from '../../../types';

// utils
import { createCanvasRefs } from '../../../../useCanvasRefs/createCanvasRefs';
import { updateShiftLockedPreview } from '../updateShiftLockedPreview';

export const createPencilDragRefs = (overrides: Partial<TPencilDragRefs> = {}): TPencilDragRefs => ({
  axisLockRef: { current: null },
  committedPointsRef: { current: null },
  rawPointsRef: { current: null },
  shiftAnchorRef: { current: null },
  tailPointsRef: { current: null },
  ...overrides,
});

describe('updateShiftLockedPreview', () => {
  it('should preview the raw current point (unlocked) while the move stays under the axis-lock threshold', () => {
    // mock — 1px move in each direction stays under the 4px lock threshold, so no axis locks yet
    const refs = createCanvasRefs();
    const pencilDragRefs = createPencilDragRefs();

    // before
    updateShiftLockedPreview(refs, pencilDragRefs, [{ x: 0, y: 0 }], [{ x: 0, y: 0 }], { x: 1, y: 1 }, 1, 4);

    // result
    expect(pencilDragRefs.axisLockRef.current).toBeNull();
    expect(refs.pencil.pencilPreviewPointsRef.current).toEqual([
      { x: 0, y: 0 },
      { x: 1, y: 1 },
    ]);
  });

  it('should lock the dominant axis on the first move without touching the committed tail', () => {
    // mock — mostly-horizontal movement (dx=10, dy=3) locks the 'x' axis
    const refs = createCanvasRefs();
    const tail = [{ x: 0, y: 0 }];
    const pencilDragRefs = createPencilDragRefs();

    // before
    updateShiftLockedPreview(refs, pencilDragRefs, [{ x: 0, y: 0 }], tail, { x: 10, y: 3 }, 1, 4);

    // result
    expect(pencilDragRefs.axisLockRef.current).toBe('x');
    expect(pencilDragRefs.shiftAnchorRef.current).toEqual({ x: 0, y: 0 });
    expect(tail).toEqual([{ x: 0, y: 0 }]);
    expect(refs.pencil.pencilPreviewPointsRef.current).toEqual([
      { x: 0, y: 0 },
      { x: 10, y: 0 },
    ]);
  });

  it('should hold the locked axis even once the mouse moves more in the other direction', () => {
    // mock — axis already locked to 'x' from a prior move; a now-more-vertical move must still
    // constrain to the horizontal line through the anchor
    const refs = createCanvasRefs();
    const pencilDragRefs = createPencilDragRefs({
      axisLockRef: { current: 'x' },
      shiftAnchorRef: { current: { x: 0, y: 0 } },
    });

    // before
    updateShiftLockedPreview(refs, pencilDragRefs, [{ x: 0, y: 0 }], [{ x: 0, y: 0 }], { x: 12, y: 20 }, 1, 4);

    // result
    expect(pencilDragRefs.axisLockRef.current).toBe('x');
    expect(refs.pencil.pencilPreviewPointsRef.current).toEqual([
      { x: 0, y: 0 },
      { x: 12, y: 0 },
    ]);
  });
});
