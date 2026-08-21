// utils
import { createCanvasRefs } from '../../../../useCanvasRefs/createCanvasRefs';
import { createSelectionToolRefs } from '../../../hooks/useSelectionToolRefs/createSelectionToolRefs';
import { disarmVectorVertexDrag } from '../disarmVectorVertexDrag';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  canvas.releasePointerCapture = vi.fn();

  return canvas;
};

const pointerEvent = (pointerId = 1): PointerEvent => new PointerEvent('pointerup', { pointerId });

describe('disarmVectorVertexDrag', () => {
  it('should do nothing when no vector vertex drag is in progress', () => {
    // mock
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const selectionRefs = createSelectionToolRefs();
    const setClassName = vi.fn();

    // before
    disarmVectorVertexDrag(canvas, pointerEvent(), canvasRefs, selectionRefs, setClassName);

    // result
    expect(canvas.releasePointerCapture).not.toHaveBeenCalled();
    expect(setClassName).not.toHaveBeenCalled();
  });

  it('should clear the vector-vertex-drag ref and the alignment guide, release pointer capture, and reset the cursor', () => {
    // mock
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const selectionRefs = createSelectionToolRefs();

    selectionRefs.vectorVertexDragRef.current = { nodeId: 'path-1', origins: { 'vertex-1': { x: 0, y: 0 } }, pointerStart: { x: 5, y: 5 } };
    canvasRefs.vectorAlignmentGuideRef.current = {
      horizontal: null,
      vertical: { anchor: { x: 0, y: 0 }, match: { x: 0, y: 0 } },
    };

    const setClassName = vi.fn();

    // before
    disarmVectorVertexDrag(canvas, pointerEvent(2), canvasRefs, selectionRefs, setClassName);

    // result
    expect(selectionRefs.vectorVertexDragRef.current).toBeNull();
    expect(canvasRefs.vectorAlignmentGuideRef.current).toBeNull();
    expect(canvas.releasePointerCapture).toHaveBeenCalledWith(2);
    expect(setClassName).toHaveBeenCalledWith(null);
  });
});
