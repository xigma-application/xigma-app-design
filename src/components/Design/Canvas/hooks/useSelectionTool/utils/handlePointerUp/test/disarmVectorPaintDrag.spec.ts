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
    const setClassName = vi.fn();

    // before
    disarmVectorPaintDrag(canvas, pointerEvent(), canvasRefs, setClassName);

    // result
    expect(canvas.releasePointerCapture).not.toHaveBeenCalled();
    expect(setClassName).not.toHaveBeenCalled();
  });

  it('should clear the paint path and touched faces, release pointer capture, and reset the cursor', () => {
    // mock
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs({
      touchedVectorPaintLoopKeysRef: { current: { 'node-1': new Set(['loop-1']) } },
      vectorPaintPathRef: {
        current: [
          { x: 0, y: 0 },
          { x: 10, y: 10 },
        ],
      },
      vectorPaintTouchedFacesRef: { current: { 'node-1': ['s1,s2,s3'] } },
    });

    canvasRefs.isVectorPaintRemoveRef.current = true;

    const setClassName = vi.fn();

    // before
    disarmVectorPaintDrag(canvas, pointerEvent(2), canvasRefs, setClassName);

    // result
    expect(canvasRefs.vectorPaintPathRef.current).toBeNull();
    expect(canvasRefs.touchedVectorPaintLoopKeysRef.current).toEqual({});
    expect(canvasRefs.vectorPaintTouchedFacesRef.current).toBeNull();
    expect(canvasRefs.isVectorPaintRemoveRef.current).toBe(false);
    expect(canvas.releasePointerCapture).toHaveBeenCalledWith(2);
    expect(setClassName).toHaveBeenCalledWith('paint');
  });
});
