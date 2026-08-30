// utils
import { drawXMarker } from '../drawXMarker';

const drawLineMock = vi.fn();

vi.mock('../drawLine', () => ({
  drawLine: (...args: unknown[]): void => drawLineMock(...args),
}));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const gl = {} as WebGL2RenderingContext;
const program = {} as WebGLProgram;
const buffer = {} as WebGLBuffer;

describe('drawXMarker', () => {
  beforeEach(() => {
    drawLineMock.mockClear();
  });

  it('should draw the two crossing diagonals of an X centred on the point', () => {
    // before
    drawXMarker(gl, program, buffer, { x: 50, y: 20 }, 4, '#cd7259', 1, 200, 150, IDENTITY_VIEWPORT);

    // result
    expect(drawLineMock).toHaveBeenNthCalledWith(
      1,
      gl,
      program,
      buffer,
      { x1: 46, x2: 54, y1: 16, y2: 24 },
      '#cd7259',
      1,
      200,
      150,
      IDENTITY_VIEWPORT,
    );
    expect(drawLineMock).toHaveBeenNthCalledWith(
      2,
      gl,
      program,
      buffer,
      { x1: 46, x2: 54, y1: 24, y2: 16 },
      '#cd7259',
      1,
      200,
      150,
      IDENTITY_VIEWPORT,
    );
  });
});
