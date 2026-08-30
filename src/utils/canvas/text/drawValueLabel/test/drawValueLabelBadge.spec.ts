// utils
import { drawValueLabelBadge } from '../drawValueLabelBadge';

const drawRectMock = vi.fn();

vi.mock('../../../drawRect/drawRect', () => ({
  drawRect: (...args: unknown[]): void => drawRectMock(...args),
}));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const gl = {} as WebGL2RenderingContext;
const program = {} as WebGLProgram;
const buffer = {} as WebGLBuffer;

describe('drawValueLabelBadge', () => {
  beforeEach(() => {
    drawRectMock.mockClear();
  });

  it('should draw a rounded rect centered on the given point, sized to the given badge dimensions', () => {
    // before
    drawValueLabelBadge(gl, program, buffer, { x: 100, y: 72 }, 22, 24, '#ff2fc2', 200, 150, IDENTITY_VIEWPORT, 0);

    // result
    expect(drawRectMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      { cornerRadius: 3, fill: '#ff2fc2', height: 24, width: 22, x: 100 - 11, y: 72 - 12 },
      200,
      150,
      IDENTITY_VIEWPORT,
      0,
    );
  });

  it('should paint the badge in the caller-supplied fill colour', () => {
    // before
    drawValueLabelBadge(gl, program, buffer, { x: 100, y: 72 }, 22, 24, '#337ae1', 200, 150, IDENTITY_VIEWPORT, 0);

    // result
    expect(drawRectMock.mock.calls[0][3].fill).toBe('#337ae1');
  });

  it('should shrink the corner radius as the viewport zooms in', () => {
    // before
    drawValueLabelBadge(gl, program, buffer, { x: 100, y: 72 }, 17, 21, '#ff2fc2', 200, 150, { x: 0, y: 0, zoom: 2 }, 0);

    // result
    expect(drawRectMock.mock.calls[0][3].cornerRadius).toBeCloseTo(1.5, 5);
  });

  it('should pass the rotation angle through to drawRect unchanged', () => {
    // before
    drawValueLabelBadge(gl, program, buffer, { x: 100, y: 72 }, 22, 24, '#ff2fc2', 200, 150, IDENTITY_VIEWPORT, 30);

    // result
    expect(drawRectMock.mock.calls[0][7]).toBe(30);
  });
});
