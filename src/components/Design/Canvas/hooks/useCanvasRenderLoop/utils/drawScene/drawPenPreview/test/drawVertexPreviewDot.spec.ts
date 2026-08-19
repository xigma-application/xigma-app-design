// utils
import { drawVertexPreviewDot } from '../drawVertexPreviewDot';

const drawEllipseMock = vi.fn();

vi.mock('utils/canvas/shapes/drawEllipse', () => ({ drawEllipse: (...args: unknown[]): void => drawEllipseMock(...args) }));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

describe('drawVertexPreviewDot', () => {
  beforeEach(() => {
    drawEllipseMock.mockClear();
  });

  it('should draw a vertex-styled dot (white fill, blue border) centered on the given point', () => {
    // before
    drawVertexPreviewDot(
      {} as WebGL2RenderingContext,
      {} as WebGLProgram,
      {} as WebGLBuffer,
      { x: 10, y: 10 },
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
  });

  it('should scale the dot with the inverse of the current zoom', () => {
    // before
    drawVertexPreviewDot({} as WebGL2RenderingContext, {} as WebGLProgram, {} as WebGLBuffer, { x: 0, y: 0 }, 100, 100, {
      x: 0,
      y: 0,
      zoom: 2,
    });

    // result
    expect(drawEllipseMock.mock.calls[0][3]).toMatchObject({ height: 2.5, width: 2.5 });
  });
});
