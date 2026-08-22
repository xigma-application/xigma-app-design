// utils
import { createCanvasRefs } from '../../../../useCanvasRefs/createCanvasRefs';
import { resolveVectorIdleHover } from '../resolveVectorIdleHover';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);

  return canvas;
};

const pointerEvent = (x: number, y: number): PointerEvent => new PointerEvent('pointermove', { clientX: x, clientY: y });

describe('resolveVectorIdleHover', () => {
  it('should run the vector hover resolvers when no vector multi-select drag is in progress', () => {
    // mock — no vector node open for editing, so resolveVectorVertexHover clears the ref unconditionally
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();

    canvasRefs.hoveredVectorVertexIdRef.current = 'sentinel';

    // before
    resolveVectorIdleHover(canvas, pointerEvent(0, 0), canvasRefs, vi.fn());

    // result — overwritten by resolveVectorVertexHover, proving the resolver chain ran
    expect(canvasRefs.hoveredVectorVertexIdRef.current).toBeNull();
  });

  it('should skip the vector hover resolvers while a vector multi-select drag (move, resize or rotate) is in progress', () => {
    // mock — an active vectorMultiDragRef should make the whole resolver chain a no-op
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();

    canvasRefs.hoveredVectorVertexIdRef.current = 'sentinel';
    canvasRefs.vectorMultiDragRef.current = {
      boxOrigin: null,
      handleOrigins: {},
      hasMoved: false,
      pendingClickAction: null,
      pointerStart: { x: 0, y: 0 },
      vertexOrigins: {},
    };

    // before
    resolveVectorIdleHover(canvas, pointerEvent(0, 0), canvasRefs, vi.fn());

    // result — untouched, proving the resolver chain never ran
    expect(canvasRefs.hoveredVectorVertexIdRef.current).toBe('sentinel');
  });
});
