// utils
import { drawSelectedWidthPointAnchor } from '../drawSelectedWidthPointAnchor';

const drawVertexDotMock = vi.fn();

vi.mock('../../drawVectorEditHandlesLayer/drawVectorVertexDots/drawVertexDot', () => ({
  drawVertexDot: (...args: unknown[]): void => drawVertexDotMock(...args),
}));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

describe('drawSelectedWidthPointAnchor', () => {
  beforeEach(() => {
    drawVertexDotMock.mockClear();
  });

  it('should draw an outer white dot at 2x size and an inner pink dot at 1.5x size, matching a selected vertex', () => {
    // before
    drawSelectedWidthPointAnchor(
      {} as WebGL2RenderingContext,
      {} as WebGLProgram,
      {} as WebGLBuffer,
      { x: 10, y: 20 },
      4,
      200,
      150,
      IDENTITY_VIEWPORT,
    );

    // result
    expect(drawVertexDotMock).toHaveBeenCalledTimes(2);
    expect(drawVertexDotMock).toHaveBeenNthCalledWith(1, {}, {}, {}, 10, 20, 8, '#ffffff', 200, 150, IDENTITY_VIEWPORT);
    expect(drawVertexDotMock).toHaveBeenNthCalledWith(2, {}, {}, {}, 10, 20, 6, '#ff2fc2', 200, 150, IDENTITY_VIEWPORT);
  });
});
