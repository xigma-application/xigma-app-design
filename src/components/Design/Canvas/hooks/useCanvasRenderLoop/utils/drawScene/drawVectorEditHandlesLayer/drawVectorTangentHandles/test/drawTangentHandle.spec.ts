// utils
import { drawTangentHandle } from '../drawTangentHandle';

const drawRectMock = vi.fn();
const drawLineMock = vi.fn();

vi.mock('utils/canvas/drawRect/drawRect', () => ({ drawRect: (...args: unknown[]): void => drawRectMock(...args) }));
vi.mock('utils/canvas/drawLine', () => ({ drawLine: (...args: unknown[]): void => drawLineMock(...args) }));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

describe('drawTangentHandle', () => {
  beforeEach(() => {
    drawRectMock.mockClear();
    drawLineMock.mockClear();
  });

  it('should draw the line in the connection-outline gray and the dot at its base size when not hovered', () => {
    // before
    drawTangentHandle(
      {} as WebGL2RenderingContext,
      {} as WebGLProgram,
      {} as WebGLBuffer,
      { x: 0, y: 0 },
      { x: 3, y: 4 },
      4,
      false,
      200,
      150,
      IDENTITY_VIEWPORT,
    );

    // result
    expect(drawLineMock).toHaveBeenCalledWith({}, {}, {}, { x1: 0, x2: 3, y1: 0, y2: 4 }, '#aaaaaa', 1, 200, 150, IDENTITY_VIEWPORT);
    expect(drawRectMock).toHaveBeenCalledWith(
      {},
      {},
      {},
      { fill: '#ffffff', height: 4, stroke: '#0d99ff', width: 4, x: 1, y: 2 },
      200,
      150,
      IDENTITY_VIEWPORT,
      45,
    );
  });

  it('should draw the line in the hover blue and enlarge the dot by the vertex hover scale when hovered, keeping the dot colors unchanged', () => {
    // before
    drawTangentHandle(
      {} as WebGL2RenderingContext,
      {} as WebGLProgram,
      {} as WebGLBuffer,
      { x: 0, y: 0 },
      { x: 3, y: 4 },
      4,
      true,
      200,
      150,
      IDENTITY_VIEWPORT,
    );

    // result — dot size grows to 4 * 1.25 = 5, still white fill / blue stroke
    expect(drawLineMock).toHaveBeenCalledWith({}, {}, {}, { x1: 0, x2: 3, y1: 0, y2: 4 }, '#a6cef7', 1, 200, 150, IDENTITY_VIEWPORT);
    expect(drawRectMock).toHaveBeenCalledWith(
      {},
      {},
      {},
      { fill: '#ffffff', height: 5, stroke: '#0d99ff', width: 5, x: 0.5, y: 1.5 },
      200,
      150,
      IDENTITY_VIEWPORT,
      45,
    );
  });
});
