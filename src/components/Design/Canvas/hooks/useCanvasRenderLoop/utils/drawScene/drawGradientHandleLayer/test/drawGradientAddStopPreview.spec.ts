// utils
import { drawGradientAddStopPreview } from '../drawGradientAddStopPreview';

const drawSingleGradientStopHandleMock = vi.fn();

vi.mock('../drawSingleGradientStopHandle', () => ({
  drawSingleGradientStopHandle: (...args: unknown[]): void => drawSingleGradientStopHandleMock(...args),
}));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

describe('drawGradientAddStopPreview', () => {
  it('should draw a stop handle at the given point, with the given color and opacity, never marked as selected', () => {
    // mock
    const gl = {} as WebGL2RenderingContext;
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawGradientAddStopPreview(gl, program, buffer, { x: 50, y: 50 }, '#ff0000', 80, 100, 100, IDENTITY_VIEWPORT);

    // result
    expect(drawSingleGradientStopHandleMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      { x: 50, y: 50 },
      '#ff0000',
      80,
      false,
      100,
      100,
      IDENTITY_VIEWPORT,
    );
  });
});
