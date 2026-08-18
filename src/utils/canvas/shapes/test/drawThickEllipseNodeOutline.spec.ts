// utils
import { drawThickEllipseNodeOutline } from '../drawThickEllipseNodeOutline';

const drawThickEllipseArcOutlineMock = vi.fn();
const drawThickEllipseOutlineMock = vi.fn();

vi.mock('../../drawThickEllipseArcOutline/drawThickEllipseArcOutline', () => ({
  drawThickEllipseArcOutline: (...args: unknown[]): void => drawThickEllipseArcOutlineMock(...args),
}));
vi.mock('../drawThickEllipseOutline', () => ({
  drawThickEllipseOutline: (...args: unknown[]): void => drawThickEllipseOutlineMock(...args),
}));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const BOUNDS = { height: 100, width: 100, x: 0, y: 0 };

describe('drawThickEllipseNodeOutline', () => {
  beforeEach(() => {
    drawThickEllipseArcOutlineMock.mockClear();
    drawThickEllipseOutlineMock.mockClear();
  });

  it('should route to the arc-aware outline when the shape has an actual angular cut', () => {
    // mock
    const ellipse = { ...BOUNDS, arcEndAngle: 0, arcStartAngle: 90 };

    // before
    drawThickEllipseNodeOutline(
      {} as WebGL2RenderingContext,
      {} as WebGLProgram,
      {} as WebGLBuffer,
      ellipse,
      '#0d99ff',
      2,
      100,
      100,
      IDENTITY_VIEWPORT,
      false,
      false,
      0,
    );

    // result
    expect(drawThickEllipseArcOutlineMock).toHaveBeenCalled();
    expect(drawThickEllipseOutlineMock).not.toHaveBeenCalled();
  });

  it('should route to the arc-aware outline for a full circle once arcRatio is above 0', () => {
    // mock
    const ellipse = { ...BOUNDS, arcEndAngle: 90, arcRatio: 0.5, arcStartAngle: 90 };

    // before
    drawThickEllipseNodeOutline(
      {} as WebGL2RenderingContext,
      {} as WebGLProgram,
      {} as WebGLBuffer,
      ellipse,
      '#0d99ff',
      2,
      100,
      100,
      IDENTITY_VIEWPORT,
      false,
      false,
      0,
    );

    // result
    expect(drawThickEllipseArcOutlineMock).toHaveBeenCalled();
    expect(drawThickEllipseOutlineMock).not.toHaveBeenCalled();
  });

  it('should route to the plain outline for a full circle with no ratio at all', () => {
    // mock
    const ellipse = { ...BOUNDS, arcEndAngle: 90, arcStartAngle: 90 };

    // before
    drawThickEllipseNodeOutline(
      {} as WebGL2RenderingContext,
      {} as WebGLProgram,
      {} as WebGLBuffer,
      ellipse,
      '#0d99ff',
      2,
      100,
      100,
      IDENTITY_VIEWPORT,
      false,
      false,
      0,
    );

    // result
    expect(drawThickEllipseOutlineMock).toHaveBeenCalled();
    expect(drawThickEllipseArcOutlineMock).not.toHaveBeenCalled();
  });
});
