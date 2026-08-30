// types
import { TVectorMultiSelectBox } from 'types/design/canvas/types';
import { TVectorMultiSelectRotateDragState } from 'types/design/selectionTool/types';

// utils
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';
import { disarmVectorMultiSelectRotateDrag } from '../disarmVectorMultiSelectRotateDrag';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  canvas.releasePointerCapture = vi.fn();
  canvas.style.cursor = 'url(some-rotate-cursor) 16 16, auto';

  return canvas;
};

const pointerEvent = (pointerId = 1): PointerEvent => new PointerEvent('pointerup', { pointerId });

const createRefs = (
  rotateDrag: TVectorMultiSelectRotateDragState | null = null,
  box: TVectorMultiSelectBox | null = null,
): ReturnType<typeof createCanvasRefs> =>
  createCanvasRefs({
    vectorMultiSelect: { vectorMultiSelectBoxRef: { current: box }, vectorMultiSelectRotateDragRef: { current: rotateDrag } },
  });

const ROTATE_DRAG: TVectorMultiSelectRotateDragState = {
  bounds: { height: 0, width: 0, x: 50, y: 50 },
  cursorAngle: 0,
  deltaDegrees: 0,
  handleOrigins: {},
  pivot: { x: 50, y: 50 },
  rotation: 0,
  startAngle: 0,
  vertexOrigins: {},
};

describe('disarmVectorMultiSelectRotateDrag', () => {
  it('should do nothing when no rotate drag is in progress', () => {
    // mock
    const canvas = createCanvas();

    // before
    disarmVectorMultiSelectRotateDrag(canvas, pointerEvent(), createRefs());

    // result
    expect(canvas.releasePointerCapture).not.toHaveBeenCalled();
  });

  it('should clear the rotate-drag ref, release pointer capture, and reset the cursor', () => {
    // mock
    const canvas = createCanvas();
    const refs = createRefs(ROTATE_DRAG, { bounds: { height: 0, width: 0, x: 50, y: 50 }, rotation: 0, selectionKey: 'v1,v2' });

    // before
    disarmVectorMultiSelectRotateDrag(canvas, pointerEvent(2), refs);

    // result
    expect(refs.vectorMultiSelect.vectorMultiSelectRotateDragRef.current).toBeNull();
    expect(canvas.releasePointerCapture).toHaveBeenCalledWith(2);
    expect(canvas.style.cursor).toBe('');
  });

  it('should persist the total accumulated rotation (existing + this gesture’s delta) onto the canonical box, keeping bounds and selection key untouched', () => {
    // mock
    const canvas = createCanvas();
    const refs = createRefs(
      { ...ROTATE_DRAG, deltaDegrees: 35, rotation: 20 },
      { bounds: { height: 0, width: 0, x: 50, y: 50 }, rotation: 20, selectionKey: 'v1,v2' },
    );

    // before
    disarmVectorMultiSelectRotateDrag(canvas, pointerEvent(2), refs);

    // result
    expect(refs.vectorMultiSelect.vectorMultiSelectBoxRef.current).toEqual({
      bounds: { height: 0, width: 0, x: 50, y: 50 },
      rotation: 55,
      selectionKey: 'v1,v2',
    });
  });

  it('should leave the canonical box untouched when there was none to begin with', () => {
    // mock
    const canvas = createCanvas();
    const refs = createRefs({ ...ROTATE_DRAG, deltaDegrees: 35, rotation: 20 }, null);

    // before
    disarmVectorMultiSelectRotateDrag(canvas, pointerEvent(2), refs);

    // result
    expect(refs.vectorMultiSelect.vectorMultiSelectBoxRef.current).toBeNull();
  });
});
