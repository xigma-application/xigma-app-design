// utils
import { drawVertexPreviewDot } from '../drawVertexPreviewDot';

const drawEllipseMock = vi.fn();
const drawDragArmableVertexCrossMock = vi.fn();

vi.mock('utils/canvas/shapes/drawEllipse', () => ({ drawEllipse: (...args: unknown[]): void => drawEllipseMock(...args) }));
vi.mock('../drawDragArmableVertexCross', () => ({
  drawDragArmableVertexCross: (...args: unknown[]): void => drawDragArmableVertexCrossMock(...args),
}));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

describe('drawVertexPreviewDot', () => {
  beforeEach(() => {
    drawEllipseMock.mockClear();
    drawDragArmableVertexCrossMock.mockClear();
  });

  it('should draw a vertex-styled dot (white fill, blue border) centered on the given point, with no cross overlay', () => {
    // before
    drawVertexPreviewDot(
      {} as WebGL2RenderingContext,
      {} as WebGLProgram,
      {} as WebGLBuffer,
      { x: 10, y: 10 },
      false,
      100,
      100,
      IDENTITY_VIEWPORT,
    );

    // result
    expect(drawEllipseMock).toHaveBeenCalledTimes(1);
    expect(drawEllipseMock).toHaveBeenCalledWith(
      {},
      {},
      {},
      { fill: '#ffffff', height: 5, stroke: '#0d99ff', width: 5, x: 7.5, y: 7.5 },
      100,
      100,
      IDENTITY_VIEWPORT,
      0,
    );
    expect(drawDragArmableVertexCrossMock).not.toHaveBeenCalled();
  });

  it('should scale the dot with the inverse of the current zoom', () => {
    // before
    drawVertexPreviewDot({} as WebGL2RenderingContext, {} as WebGLProgram, {} as WebGLBuffer, { x: 0, y: 0 }, false, 100, 100, {
      x: 0,
      y: 0,
      zoom: 2,
    });

    // result
    expect(drawEllipseMock.mock.calls[0][3]).toMatchObject({ height: 2.5, width: 2.5 });
  });

  it('should draw the same dot plus a small cross overlay, not a different shape, when isDragArmable is true', () => {
    // before
    drawVertexPreviewDot(
      {} as WebGL2RenderingContext,
      {} as WebGLProgram,
      {} as WebGLBuffer,
      { x: 10, y: 10 },
      true,
      100,
      100,
      IDENTITY_VIEWPORT,
    );

    // result — the plain white/blue dot always draws first, unchanged
    expect(drawEllipseMock).toHaveBeenCalledTimes(1);
    expect(drawEllipseMock).toHaveBeenCalledWith(
      {},
      {},
      {},
      { fill: '#ffffff', height: 5, stroke: '#0d99ff', width: 5, x: 7.5, y: 7.5 },
      100,
      100,
      IDENTITY_VIEWPORT,
      0,
    );
    // result — the cross overlay draws on top, sized from the same vertexSize the dot used
    expect(drawDragArmableVertexCrossMock).toHaveBeenCalledWith({}, {}, {}, { x: 10, y: 10 }, 5, 100, 100, IDENTITY_VIEWPORT);
  });
});
