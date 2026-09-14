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
    drawGradientAddStopPreview(
      { buffer, canvasHeight: 100, canvasWidth: 100, gl, program, viewport: IDENTITY_VIEWPORT },
      { x: 50, y: 50 },
      { x: 0, y: 1 },
      '#ff0000',
      80,
    );

    // result
    expect(drawSingleGradientStopHandleMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      { x: 50, y: 50 },
      { x: 0, y: 1 },
      '#ff0000',
      80,
      false,
      100,
      100,
      IDENTITY_VIEWPORT,
    );
  });
});
