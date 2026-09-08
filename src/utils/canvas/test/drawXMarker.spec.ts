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

  it('should rotate the diagonals about the centre when a rotation is given', () => {
    // before
    drawXMarker(gl, program, buffer, { x: 0, y: 0 }, 10, '#000', 1, 200, 150, IDENTITY_VIEWPORT, 90);

    // result — corner (-10, -10) rotated 90° about the origin → (10, -10); (10, 10) → (-10, 10)
    const [firstSegment] = [drawLineMock.mock.calls[0][3]];
    expect(firstSegment.x1).toBeCloseTo(10);
    expect(firstSegment.y1).toBeCloseTo(-10);
    expect(firstSegment.x2).toBeCloseTo(-10);
    expect(firstSegment.y2).toBeCloseTo(10);
  });
});
