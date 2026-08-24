// utils
import { drawSelectedWidthHandleDiamond } from '../drawSelectedWidthHandleDiamond';

const drawHandleDiamondMock = vi.fn();

vi.mock('../../drawVectorEditHandlesLayer/drawVectorTangentHandles/drawHandleDiamond', () => ({
  drawHandleDiamond: (...args: unknown[]): void => drawHandleDiamondMock(...args),
}));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

describe('drawSelectedWidthHandleDiamond', () => {
  beforeEach(() => {
    drawHandleDiamondMock.mockClear();
  });

  it('should draw an outer white diamond at 2x size and an inner pink diamond at 1.5x size', () => {
    // before
    drawSelectedWidthHandleDiamond(
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
    expect(drawHandleDiamondMock).toHaveBeenCalledTimes(2);
    expect(drawHandleDiamondMock).toHaveBeenNthCalledWith(1, {}, {}, {}, { x: 10, y: 20 }, 8, '#ffffff', 200, 150, IDENTITY_VIEWPORT);
    expect(drawHandleDiamondMock).toHaveBeenNthCalledWith(2, {}, {}, {}, { x: 10, y: 20 }, 6, '#ff2fc2', 200, 150, IDENTITY_VIEWPORT);
  });
});
