// utils
import { drawHandleDiamond } from '../drawHandleDiamond';

const drawRectMock = vi.fn();

vi.mock('utils/canvas/drawRect/drawRect', () => ({ drawRect: (...args: unknown[]): void => drawRectMock(...args) }));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

describe('drawHandleDiamond', () => {
  beforeEach(() => {
    drawRectMock.mockClear();
  });

  it('should draw a plain filled square centered on the handle, rotated 45deg into a diamond', () => {
    // before
    drawHandleDiamond(
      {} as WebGL2RenderingContext,
      {} as WebGLProgram,
      {} as WebGLBuffer,
      { x: 10, y: 20 },
      6,
      '#0d99ff',
      200,
      150,
      IDENTITY_VIEWPORT,
    );

    // result
    expect(drawRectMock).toHaveBeenCalledWith(
      {},
      {},
      {},
      { fill: '#0d99ff', height: 6, width: 6, x: 7, y: 17 },
      200,
      150,
      IDENTITY_VIEWPORT,
      45,
    );
  });
});
