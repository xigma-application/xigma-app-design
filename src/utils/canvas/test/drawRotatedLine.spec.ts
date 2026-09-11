// utils
import { drawRotatedLine } from '../drawRotatedLine';

const drawLineMock = vi.fn();

vi.mock('../drawLine', () => ({
  drawLine: (...args: unknown[]): void => drawLineMock(...args),
}));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const gl = {} as WebGL2RenderingContext;
const program = {} as WebGLProgram;
const buffer = {} as WebGLBuffer;

describe('drawRotatedLine', () => {
  beforeEach(() => {
    drawLineMock.mockClear();
  });

  it('should forward the line unrotated when the rotation is zero', () => {
    drawRotatedLine(gl, program, buffer, { x1: 0, x2: 10, y1: 0, y2: 0 }, '#ffffff', 2, 200, 150, IDENTITY_VIEWPORT, 0, { x: 5, y: 0 });

    expect(drawLineMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      { x1: 0, x2: 10, y1: 0, y2: 0 },
      '#ffffff',
      2,
      200,
      150,
      IDENTITY_VIEWPORT,
    );
  });

  it('should rotate both endpoints about the given center before drawing', () => {
    drawRotatedLine(gl, program, buffer, { x1: 5, x2: 5, y1: -10, y2: 10 }, '#ffffff', 2, 200, 150, IDENTITY_VIEWPORT, 90, { x: 5, y: 0 });

    const [, , , line] = drawLineMock.mock.calls[0];

    expect(line.x1).toBeCloseTo(15, 5);
    expect(line.y1).toBeCloseTo(0, 5);
    expect(line.x2).toBeCloseTo(-5, 5);
    expect(line.y2).toBeCloseTo(0, 5);
  });
});
