// utils
import { drawGapFill } from '../drawGapFill';

const drawFillRectMock = vi.fn();

vi.mock('../drawFillRect', () => ({
  drawFillRect: (...args: unknown[]): void => drawFillRectMock(...args),
}));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const gl = {} as WebGL2RenderingContext;
const program = {} as WebGLProgram;
const buffer = {} as WebGLBuffer;
const extent = { height: 100, width: 200, x: 0, y: 0 };

describe('drawGapFill', () => {
  beforeEach(() => {
    drawFillRectMock.mockClear();
  });

  it('should draw a vertical strip spanning the extent height, centered on the gap midpoint, for the x axis', () => {
    const gap = { index: 0, midpoint: { x: 75, y: 25 }, span: { x1: 75, x2: 75, y1: 0, y2: 50 }, value: 50 };

    drawGapFill(gl, program, buffer, gap, 'x', extent, 200, 200, IDENTITY_VIEWPORT);

    expect(drawFillRectMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      { height: 100, width: 50, x: 50, y: 0 },
      200,
      200,
      IDENTITY_VIEWPORT,
    );
  });

  it('should draw a horizontal strip spanning the extent width, centered on the gap midpoint, for the y axis', () => {
    const gap = { index: 0, midpoint: { x: 75, y: 75 }, span: { x1: 0, x2: 150, y1: 75, y2: 75 }, value: 50 };

    drawGapFill(gl, program, buffer, gap, 'y', extent, 200, 200, IDENTITY_VIEWPORT);

    expect(drawFillRectMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      { height: 50, width: 200, x: 0, y: 50 },
      200,
      200,
      IDENTITY_VIEWPORT,
    );
  });
});
