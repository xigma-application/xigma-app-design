// utils
import { drawDefaultWidthHandleDiamond } from '../drawDefaultWidthHandleDiamond';

const drawRectMock = vi.fn();

vi.mock('utils/canvas/drawRect/drawRect', () => ({ drawRect: (...args: unknown[]): void => drawRectMock(...args) }));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

describe('drawDefaultWidthHandleDiamond', () => {
  beforeEach(() => {
    drawRectMock.mockClear();
  });

  it('should draw a white-fill/pink-border diamond at the given size', () => {
    // before
    drawDefaultWidthHandleDiamond(
      {} as WebGL2RenderingContext,
      {} as WebGLProgram,
      {} as WebGLBuffer,
      { x: 3, y: 4 },
      4,
      200,
      150,
      IDENTITY_VIEWPORT,
    );

    // result
    expect(drawRectMock).toHaveBeenCalledWith(
      {},
      {},
      {},
      { fill: '#ffffff', height: 4, stroke: '#ff2fc2', width: 4, x: 1, y: 2 },
      200,
      150,
      IDENTITY_VIEWPORT,
      45,
    );
  });
});
