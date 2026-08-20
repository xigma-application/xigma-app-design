// utils
import { drawVectorMultiSelectRotateDragBox } from '../drawVectorMultiSelectRotateDragBox';

const drawRectMock = vi.fn();

vi.mock('utils/canvas/drawRect/drawRect', () => ({ drawRect: (...args: unknown[]): void => drawRectMock(...args) }));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

describe('drawVectorMultiSelectRotateDragBox', () => {
  beforeEach(() => {
    drawRectMock.mockClear();
  });

  it('should draw the original (pre-drag) bounds rotated by the live total angle, around the drag’s own pivot, while a rotate drag is active', () => {
    // before
    drawVectorMultiSelectRotateDragBox(
      {} as WebGL2RenderingContext,
      {} as WebGLProgram,
      {} as WebGLBuffer,
      {
        bounds: { height: 40, width: 100, x: 0, y: 0 },
        cursorAngle: 0,
        deltaDegrees: 20,
        handleOrigins: {},
        nodeId: 'vector-1',
        pivot: { x: 50, y: 20 },
        rotation: 10,
        startAngle: 0,
        vertexOrigins: {},
      },
      200,
      150,
      IDENTITY_VIEWPORT,
    );

    // result — rotation is existing (10) + live delta (20) = 30
    expect(drawRectMock).toHaveBeenCalledWith(
      {},
      {},
      {},
      { height: 40, stroke: '#0d99ff', width: 100, x: 0, y: 0 },
      200,
      150,
      IDENTITY_VIEWPORT,
      30,
      { x: 50, y: 20 },
    );
  });
});
