// store
import { setPaintBlendMode } from 'store/design/slice';

// types
import { BlendMode } from 'types/design/enums';

// utils
import { createCanvasRefs } from '../../../../useCanvasRefs/createCanvasRefs';
import { disarmVectorPaintDrag } from '../disarmVectorPaintDrag';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  canvas.releasePointerCapture = vi.fn();

  return canvas;
};

const pointerEvent = (pointerId = 1): PointerEvent => new PointerEvent('pointerup', { pointerId });

describe('disarmVectorPaintDrag', () => {
  it('should do nothing when no paint drag is in progress', () => {
    // mock
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const dispatch = vi.fn();
    const setClassName = vi.fn();

    // before
    disarmVectorPaintDrag(canvas, pointerEvent(), dispatch, canvasRefs, setClassName);

    // result
    expect(canvas.releasePointerCapture).not.toHaveBeenCalled();
    expect(setClassName).not.toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('should clear the paint path and touched faces, release pointer capture, and reset the cursor without resetting the blend mode when removing', () => {
    // mock
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs({
      vectorPaint: {
        touchedVectorPaintLoopKeysRef: { current: { 'node-1': new Set(['loop-1']) } },
        vectorPaintPathRef: {
          current: [
            { x: 0, y: 0 },
            { x: 10, y: 10 },
          ],
        },
        vectorPaintTouchedFacesRef: { current: { 'node-1': ['s1,s2,s3'] } },
      },
    });

    canvasRefs.vectorPaint.isVectorPaintRemoveRef.current = true;

    const dispatch = vi.fn();
    const setClassName = vi.fn();

    // before
    disarmVectorPaintDrag(canvas, pointerEvent(2), dispatch, canvasRefs, setClassName);

    // result
    expect(canvasRefs.vectorPaint.vectorPaintPathRef.current).toBeNull();
    expect(canvasRefs.vectorPaint.touchedVectorPaintLoopKeysRef.current).toEqual({});
    expect(canvasRefs.vectorPaint.vectorPaintTouchedFacesRef.current).toBeNull();
    expect(canvasRefs.vectorPaint.isVectorPaintRemoveRef.current).toBe(false);
    expect(canvas.releasePointerCapture).toHaveBeenCalledWith(2);
    expect(setClassName).toHaveBeenCalledWith('paint');
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('should reset the tool blend mode back to Normal once a fill stroke ends', () => {
    // mock
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs({
      vectorPaint: {
        vectorPaintPathRef: { current: [{ x: 0, y: 0 }] },
      },
    });
    const dispatch = vi.fn();
    const setClassName = vi.fn();

    // before
    disarmVectorPaintDrag(canvas, pointerEvent(), dispatch, canvasRefs, setClassName);

    // result
    expect(dispatch).toHaveBeenCalledWith(setPaintBlendMode(BlendMode.normal));
  });
});
