// utils
import { drawGradientStopHandles } from '../drawGradientStopHandles';

const drawSingleGradientStopHandleMock = vi.fn();

vi.mock('../drawSingleGradientStopHandle', () => ({
  drawSingleGradientStopHandle: (...args: unknown[]): void => drawSingleGradientStopHandleMock(...args),
}));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const DOWN = { x: 0, y: 1 };
const STOPS = [
  { color: '#ff0000', opacity: 100, position: 0 },
  { color: '#00ff00', opacity: 50, position: 1 },
];
const POSITIONS = [
  { x: 50, y: 50 },
  { x: 60, y: 60 },
];

describe('drawGradientStopHandles', () => {
  beforeEach(() => {
    drawSingleGradientStopHandleMock.mockClear();
  });

  it('should draw one handle per stop, at its own position with its own color and opacity', () => {
    // mock
    const gl = {} as WebGL2RenderingContext;
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawGradientStopHandles(
      { buffer, canvasHeight: 100, canvasWidth: 100, gl, program, viewport: IDENTITY_VIEWPORT },
      STOPS,
      POSITIONS,
      [DOWN, DOWN],
      null,
    );

    // result
    expect(drawSingleGradientStopHandleMock).toHaveBeenCalledTimes(2);
    expect(drawSingleGradientStopHandleMock).toHaveBeenNthCalledWith(
      1,
      gl,
      program,
      buffer,
      POSITIONS[0],
      DOWN,
      '#ff0000',
      100,
      false,
      100,
      100,
      IDENTITY_VIEWPORT,
    );
    expect(drawSingleGradientStopHandleMock).toHaveBeenNthCalledWith(
      2,
      gl,
      program,
      buffer,
      POSITIONS[1],
      DOWN,
      '#00ff00',
      50,
      false,
      100,
      100,
      IDENTITY_VIEWPORT,
    );
  });

  it('should mark only the selected stop as selected', () => {
    // mock
    const gl = {} as WebGL2RenderingContext;
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawGradientStopHandles(
      { buffer, canvasHeight: 100, canvasWidth: 100, gl, program, viewport: IDENTITY_VIEWPORT },
      STOPS,
      POSITIONS,
      [DOWN, DOWN],
      1,
    );

    // result
    const [firstCall, secondCall] = drawSingleGradientStopHandleMock.mock.calls;

    expect(firstCall[7]).toBe(false);
    expect(secondCall[7]).toBe(true);
  });
});
