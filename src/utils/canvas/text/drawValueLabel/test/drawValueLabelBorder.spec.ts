// utils
import { drawValueLabelBorder } from '../drawValueLabelBorder';

const drawRectMock = vi.fn();

vi.mock('../../../drawRect/drawRect', () => ({
  drawRect: (...args: unknown[]): void => drawRectMock(...args),
}));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const gl = {} as WebGL2RenderingContext;
const program = {} as WebGLProgram;
const buffer = {} as WebGLBuffer;

describe('drawValueLabelBorder', () => {
  beforeEach(() => {
    drawRectMock.mockClear();
  });

  it('should draw a white rect 2px bigger than the badge on every side, at zoom 1', () => {
    // before
    drawValueLabelBorder(gl, program, buffer, { x: 100, y: 72 }, 22, 24, 200, 150, IDENTITY_VIEWPORT, 0);

    // result
    expect(drawRectMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      { cornerRadius: 5, fill: '#ffffff', height: 28, width: 26, x: 100 - 13, y: 72 - 14 },
      200,
      150,
      IDENTITY_VIEWPORT,
      0,
    );
  });

  it('should shrink the border together with the badge as the viewport zooms in', () => {
    // before — zoomed in 2x: the 2px border becomes 1 world-unit
    drawValueLabelBorder(gl, program, buffer, { x: 100, y: 72 }, 17, 21, 200, 150, { x: 0, y: 0, zoom: 2 }, 0);

    // result
    const [, , , rect] = drawRectMock.mock.calls[0];

    expect(rect.width).toBeCloseTo(19, 5); // 17 (badge width) + 2 * 1 (border)
    expect(rect.cornerRadius).toBeCloseTo(2.5, 5); // 1.5 (corner radius at zoom 2) + 1 (border)
  });

  it('should pass the rotation angle through to drawRect unchanged', () => {
    // before
    drawValueLabelBorder(gl, program, buffer, { x: 100, y: 72 }, 22, 24, 200, 150, IDENTITY_VIEWPORT, 30);

    // result
    expect(drawRectMock.mock.calls[0][7]).toBe(30);
  });
});
