// store
import { store } from 'store';

// types
import { TPencilDragRefs } from '../../../types';

// utils
import { createCanvasRefs } from '../../../../useCanvasRefs/createCanvasRefs';
import { handlePointerMove } from '../handlePointerMove';

export const createPencilDragRefs = (overrides: Partial<TPencilDragRefs> = {}): TPencilDragRefs => ({
  axisLockRef: { current: null },
  committedPointsRef: { current: null },
  rawPointsRef: { current: null },
  shiftAnchorRef: { current: null },
  tailPointsRef: { current: null },
  ...overrides,
});

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);

  return canvas;
};

const pointerEvent = (x: number, y: number, options: Partial<PointerEventInit> = {}): PointerEvent =>
  new PointerEvent('pointermove', { clientX: x, clientY: y, pointerId: 1, ...options });

describe('handlePointerMove', () => {
  it('should do nothing when there is no stroke in progress', () => {
    // mock
    const canvas = createCanvas();
    const refs = createCanvasRefs();

    // before
    handlePointerMove(canvas, pointerEvent(10, 10), store, refs, createPencilDragRefs());

    // result
    expect(refs.pencil.pencilPreviewPointsRef.current).toBeNull();
  });

  it('should do nothing when the raw-points tracker alone is missing', () => {
    // mock — committed/tail are set, but rawPointsRef is null (e.g. a stale call after cleanup)
    const canvas = createCanvas();
    const refs = createCanvasRefs();
    const pencilDragRefs = createPencilDragRefs({
      committedPointsRef: { current: [{ x: 0, y: 0 }] },
      tailPointsRef: { current: [{ x: 0, y: 0 }] },
    });

    // before
    handlePointerMove(canvas, pointerEvent(10, 10), store, refs, pencilDragRefs);

    // result
    expect(refs.pencil.pencilPreviewPointsRef.current).toBeNull();
  });

  it('should delegate to advancePencilTail for an ordinary (non-Shift) move', () => {
    // mock
    const canvas = createCanvas();
    const refs = createCanvasRefs();
    const pencilDragRefs = createPencilDragRefs({
      committedPointsRef: { current: [{ x: 0, y: 0 }] },
      rawPointsRef: { current: [{ x: 0, y: 0 }] },
      tailPointsRef: { current: [{ x: 0, y: 0 }] },
    });

    // before
    handlePointerMove(canvas, pointerEvent(5, 0), store, refs, pencilDragRefs);

    // result — the real tail grows, proving advancePencilTail ran (updateShiftLockedPreview never touches it)
    expect(pencilDragRefs.tailPointsRef.current).toEqual([
      { x: 0, y: 0 },
      { x: 5, y: 0 },
    ]);
  });

  it('should delegate to updateShiftLockedPreview for a Shift-held move, leaving the real tail untouched', () => {
    // mock
    const canvas = createCanvas();
    const refs = createCanvasRefs();
    const pencilDragRefs = createPencilDragRefs({
      committedPointsRef: { current: [{ x: 0, y: 0 }] },
      rawPointsRef: { current: [{ x: 0, y: 0 }] },
      tailPointsRef: { current: [{ x: 0, y: 0 }] },
    });

    // before
    handlePointerMove(canvas, pointerEvent(10, 3, { shiftKey: true }), store, refs, pencilDragRefs);

    // result — axis-lock preview only, real tail unchanged (that's advancePencilTail's job)
    expect(pencilDragRefs.tailPointsRef.current).toEqual([{ x: 0, y: 0 }]);
    expect(refs.pencil.pencilPreviewPointsRef.current).toEqual([
      { x: 0, y: 0 },
      { x: 10, y: 0 },
    ]);
  });

  it('should update the raw preview on every move regardless of Shift state', () => {
    // mock
    const canvas = createCanvas();
    const refs = createCanvasRefs();
    const pencilDragRefs = createPencilDragRefs({
      committedPointsRef: { current: [{ x: 0, y: 0 }] },
      rawPointsRef: { current: [{ x: 0, y: 0 }] },
      tailPointsRef: { current: [{ x: 0, y: 0 }] },
    });

    // before
    handlePointerMove(canvas, pointerEvent(5, 0, { ctrlKey: true }), store, refs, pencilDragRefs);

    // result
    expect(refs.pencil.pencilShowRawPreviewRef.current).toBe(true);
    expect(pencilDragRefs.rawPointsRef.current).toEqual([
      { x: 0, y: 0 },
      { x: 5, y: 0 },
    ]);
  });
});
