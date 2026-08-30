// utils
import { drawSelectedTangentHandleDot } from '../drawSelectedTangentHandleDot';

const drawHandleDiamondMock = vi.fn();

vi.mock('../drawHandleDiamond', () => ({ drawHandleDiamond: (...args: unknown[]): void => drawHandleDiamondMock(...args) }));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

describe('drawSelectedTangentHandleDot', () => {
  beforeEach(() => {
    drawHandleDiamondMock.mockClear();
  });

  it('should draw an outer white diamond at 2x dot size and an inner blue diamond at 1.5x dot size', () => {
    // before
    drawSelectedTangentHandleDot(
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
    expect(drawHandleDiamondMock).toHaveBeenNthCalledWith(2, {}, {}, {}, { x: 10, y: 20 }, 6, '#337ae1', 200, 150, IDENTITY_VIEWPORT);
  });
});
