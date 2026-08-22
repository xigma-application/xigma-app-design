// utils
import { drawVectorMultiSelectResizeDragBox } from '../drawVectorMultiSelectResizeDragBox';

const drawRectMock = vi.fn();

vi.mock('utils/canvas/drawRect/drawRect', () => ({ drawRect: (...args: unknown[]): void => drawRectMock(...args) }));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

describe('drawVectorMultiSelectResizeDragBox', () => {
  beforeEach(() => {
    drawRectMock.mockClear();
  });

  it('should draw the live (scaled) resize-drag bounds, rotated by the box’s own rotation, with no separate pivot argument — liveBounds arrives here already repositioned (repositionRotatedVectorMultiSelectBounds, see continueVectorMultiSelectResizeDrag.ts) so its OWN center is already the correct rotation pivot, matching every other rotated shape in this app, which always spins around its own bounds’ center; this function does not need to (and must not) re-derive a separate pivot on top of that', () => {
    // before
    drawVectorMultiSelectResizeDragBox(
      {} as WebGL2RenderingContext,
      {} as WebGLProgram,
      {} as WebGLBuffer,
      {
        anchor: { x: 0, y: 0 },
        anchorWorld: { x: 16.7, y: -22.3 },
        bounds: { height: 40, width: 100, x: 0, y: 0 },
        handle: 'se',
        handleOrigins: {},
        liveBounds: { height: 80, width: 200, x: -16.7, y: 22.3 },
        rotation: 30,
        vertexOrigins: {},
      },
      200,
      150,
      IDENTITY_VIEWPORT,
    );

    // result
    expect(drawRectMock).toHaveBeenCalledWith(
      {},
      {},
      {},
      { height: 80, stroke: '#0d99ff', width: 200, x: -16.7, y: 22.3 },
      200,
      150,
      IDENTITY_VIEWPORT,
      30,
    );
  });
});
