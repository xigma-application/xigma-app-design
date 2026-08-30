// utils
import { drawDefaultTangentHandleDot } from '../drawDefaultTangentHandleDot';

const drawRectMock = vi.fn();

vi.mock('utils/canvas/drawRect/drawRect', () => ({ drawRect: (...args: unknown[]): void => drawRectMock(...args) }));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

describe('drawDefaultTangentHandleDot', () => {
  beforeEach(() => {
    drawRectMock.mockClear();
  });

  it('should draw a white-fill/blue-border diamond at the base dot size when not hovered', () => {
    // before
    drawDefaultTangentHandleDot(
      {} as WebGL2RenderingContext,
      {} as WebGLProgram,
      {} as WebGLBuffer,
      { x: 3, y: 4 },
      4,
      false,
      200,
      150,
      IDENTITY_VIEWPORT,
    );

    // result
    expect(drawRectMock).toHaveBeenCalledWith(
      {},
      {},
      {},
      { fill: '#ffffff', height: 4, stroke: '#337ae1', width: 4, x: 1, y: 2 },
      200,
      150,
      IDENTITY_VIEWPORT,
      45,
    );
  });

  it('should enlarge the diamond by the vertex hover scale when hovered, keeping the same fill/border colors', () => {
    // before
    drawDefaultTangentHandleDot(
      {} as WebGL2RenderingContext,
      {} as WebGLProgram,
      {} as WebGLBuffer,
      { x: 3, y: 4 },
      4,
      true,
      200,
      150,
      IDENTITY_VIEWPORT,
    );

    // result — dot size grows to 4 * 1.25 = 5
    expect(drawRectMock).toHaveBeenCalledWith(
      {},
      {},
      {},
      { fill: '#ffffff', height: 5, stroke: '#337ae1', width: 5, x: 0.5, y: 1.5 },
      200,
      150,
      IDENTITY_VIEWPORT,
      45,
    );
  });
});
