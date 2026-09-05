// utils
import { drawFillRect } from '../drawFillRect';

const drawRectMock = vi.fn();

vi.mock('utils/canvas/drawRect/drawRect', () => ({
  drawRect: (...args: unknown[]): void => drawRectMock(...args),
}));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const gl = {} as WebGL2RenderingContext;
const program = {} as WebGLProgram;
const buffer = {} as WebGLBuffer;

describe('drawFillRect', () => {
  beforeEach(() => {
    drawRectMock.mockClear();
  });

  it('should draw the given rect with the smart-selection swap fill color at 0.3 alpha and no border', () => {
    drawFillRect(gl, program, buffer, { height: 50, width: 50, x: 0, y: 0 }, 200, 200, IDENTITY_VIEWPORT);

    expect(drawRectMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      { fill: '#ff2fc2', fillAlpha: 0.3, height: 50, width: 50, x: 0, y: 0 },
      200,
      200,
      IDENTITY_VIEWPORT,
      0,
    );
  });
});
