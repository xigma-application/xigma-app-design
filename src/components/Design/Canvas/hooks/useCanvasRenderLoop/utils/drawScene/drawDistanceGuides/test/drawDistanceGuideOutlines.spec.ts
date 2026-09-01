// utils
import { drawDistanceGuideOutlines } from '../drawDistanceGuideOutlines';

const drawThickOutlineMock = vi.fn();

vi.mock('utils/canvas/drawThickOutline/drawThickOutline', () => ({
  drawThickOutline: (...args: unknown[]): void => drawThickOutlineMock(...args),
}));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const gl = {} as WebGL2RenderingContext;
const program = {} as WebGLProgram;
const buffer = {} as WebGLBuffer;

describe('drawDistanceGuideOutlines', () => {
  beforeEach(() => {
    drawThickOutlineMock.mockClear();
  });

  it('should draw an outline around both the active and target rects', () => {
    // before
    const activeRect = { height: 100, width: 100, x: 0, y: 0 };
    const targetRect = { height: 40, width: 50, x: 200, y: 300 };

    // action
    drawDistanceGuideOutlines(gl, program, buffer, { activeRect, labels: [], lines: [], targetRect }, 200, 150, IDENTITY_VIEWPORT);

    // result
    expect(drawThickOutlineMock).toHaveBeenCalledTimes(2);
    expect(drawThickOutlineMock).toHaveBeenNthCalledWith(1, gl, program, buffer, activeRect, '#cd4422', 2, 200, 150, IDENTITY_VIEWPORT, 0);
    expect(drawThickOutlineMock).toHaveBeenNthCalledWith(2, gl, program, buffer, targetRect, '#cd4422', 2, 200, 150, IDENTITY_VIEWPORT, 0);
  });

  it('should draw nothing when the rects are missing', () => {
    // action
    drawDistanceGuideOutlines(gl, program, buffer, { labels: [], lines: [] }, 200, 150, IDENTITY_VIEWPORT);

    // result
    expect(drawThickOutlineMock).not.toHaveBeenCalled();
  });
});
