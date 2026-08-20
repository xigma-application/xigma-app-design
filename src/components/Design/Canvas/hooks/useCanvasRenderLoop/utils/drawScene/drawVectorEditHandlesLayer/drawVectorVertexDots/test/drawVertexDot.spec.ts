// utils
import { drawVertexDot } from '../drawVertexDot';

const drawEllipseMock = vi.fn();

vi.mock('utils/canvas/shapes/drawEllipse', () => ({ drawEllipse: (...args: unknown[]): void => drawEllipseMock(...args) }));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

describe('drawVertexDot', () => {
  beforeEach(() => {
    drawEllipseMock.mockClear();
  });

  it('should draw an ellipse of the given size and fill, centered on the given point', () => {
    // before
    drawVertexDot({} as WebGL2RenderingContext, {} as WebGLProgram, {} as WebGLBuffer, 10, 20, 6, '#ffffff', 200, 150, IDENTITY_VIEWPORT);

    // result
    expect(drawEllipseMock).toHaveBeenCalledWith(
      {},
      {},
      {},
      { fill: '#ffffff', height: 6, width: 6, x: 7, y: 17 },
      200,
      150,
      IDENTITY_VIEWPORT,
      0,
    );
  });
});
