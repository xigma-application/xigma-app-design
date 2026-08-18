// utils
import { drawEllipseNode } from '../drawEllipseNode';

const drawEllipseArcMock = vi.fn();
const drawEllipseMock = vi.fn();

vi.mock('../drawEllipseArc', () => ({ drawEllipseArc: (...args: unknown[]): void => drawEllipseArcMock(...args) }));
vi.mock('../shapes/drawEllipse', () => ({ drawEllipse: (...args: unknown[]): void => drawEllipseMock(...args) }));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const BOUNDS = { height: 100, width: 100, x: 0, y: 0 };

describe('drawEllipseNode', () => {
  beforeEach(() => {
    drawEllipseArcMock.mockClear();
    drawEllipseMock.mockClear();
  });

  it('should route to the arc-aware draw path when the shape has an actual angular cut', () => {
    // mock
    const ellipse = { ...BOUNDS, arcEndAngle: 0, arcStartAngle: 90 };

    // before
    drawEllipseNode(
      {} as WebGL2RenderingContext,
      {} as WebGLProgram,
      {} as WebGLBuffer,
      ellipse,
      100,
      100,
      IDENTITY_VIEWPORT,
      false,
      false,
      0,
    );

    // result
    expect(drawEllipseArcMock).toHaveBeenCalled();
    expect(drawEllipseMock).not.toHaveBeenCalled();
  });

  it('should route to the arc-aware draw path for a full circle once arcRatio is above 0', () => {
    // mock
    const ellipse = { ...BOUNDS, arcEndAngle: 90, arcRatio: 0.5, arcStartAngle: 90 };

    // before
    drawEllipseNode(
      {} as WebGL2RenderingContext,
      {} as WebGLProgram,
      {} as WebGLBuffer,
      ellipse,
      100,
      100,
      IDENTITY_VIEWPORT,
      false,
      false,
      0,
    );

    // result
    expect(drawEllipseArcMock).toHaveBeenCalled();
    expect(drawEllipseMock).not.toHaveBeenCalled();
  });

  it('should route to the plain ellipse path for a full circle with no ratio at all', () => {
    // mock
    const ellipse = { ...BOUNDS, arcEndAngle: 90, arcStartAngle: 90 };

    // before
    drawEllipseNode(
      {} as WebGL2RenderingContext,
      {} as WebGLProgram,
      {} as WebGLBuffer,
      ellipse,
      100,
      100,
      IDENTITY_VIEWPORT,
      false,
      false,
      0,
    );

    // result
    expect(drawEllipseMock).toHaveBeenCalled();
    expect(drawEllipseArcMock).not.toHaveBeenCalled();
  });
});
