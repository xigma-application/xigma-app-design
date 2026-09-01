// utils
import { drawDistanceGuideLine } from '../drawDistanceGuideLine';

const drawLineMock = vi.fn();
const drawDashedLineMock = vi.fn();

vi.mock('utils/canvas/drawLine', () => ({ drawLine: (...args: unknown[]): void => drawLineMock(...args) }));
vi.mock('utils/canvas/drawDashedLine', () => ({ drawDashedLine: (...args: unknown[]): void => drawDashedLineMock(...args) }));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const gl = {} as WebGL2RenderingContext;
const program = {} as WebGLProgram;
const buffer = {} as WebGLBuffer;

describe('drawDistanceGuideLine', () => {
  beforeEach(() => {
    drawLineMock.mockClear();
    drawDashedLineMock.mockClear();
  });

  it('should draw a solid line via drawLine', () => {
    // before
    drawDistanceGuideLine(gl, program, buffer, { dashed: false, x1: 0, x2: 100, y1: 50, y2: 50 }, 200, 150, IDENTITY_VIEWPORT);

    // result
    expect(drawDashedLineMock).not.toHaveBeenCalled();
    expect(drawLineMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      { dashed: false, x1: 0, x2: 100, y1: 50, y2: 50 },
      '#cd4422',
      1,
      200,
      150,
      IDENTITY_VIEWPORT,
    );
  });

  it('should draw a dashed line via drawDashedLine', () => {
    // before
    drawDistanceGuideLine(gl, program, buffer, { dashed: true, x1: 0, x2: 0, y1: 0, y2: 100 }, 200, 150, IDENTITY_VIEWPORT);

    // result
    expect(drawLineMock).not.toHaveBeenCalled();
    expect(drawDashedLineMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      { dashed: true, x1: 0, x2: 0, y1: 0, y2: 100 },
      '#cd4422',
      1,
      200,
      150,
      IDENTITY_VIEWPORT,
      3,
      4.5,
    );
  });

  it('should scale the stroke width down with zoom', () => {
    // before
    drawDistanceGuideLine(gl, program, buffer, { dashed: false, x1: 0, x2: 10, y1: 0, y2: 0 }, 200, 150, { x: 0, y: 0, zoom: 2 });

    // result
    expect(drawLineMock.mock.calls[0][5]).toBe(0.5);
  });
});
