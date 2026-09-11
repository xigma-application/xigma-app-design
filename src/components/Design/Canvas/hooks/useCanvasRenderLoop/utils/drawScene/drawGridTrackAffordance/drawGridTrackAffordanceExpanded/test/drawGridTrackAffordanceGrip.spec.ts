// types
import { TDrawSceneContext } from '../../../types';

// utils
import { drawGridTrackAffordanceGrip } from '../drawGridTrackAffordanceGrip';

const drawRotatedLineMock = vi.fn();

vi.mock('utils/canvas/drawRotatedLine', () => ({
  drawRotatedLine: (...args: unknown[]): void => drawRotatedLineMock(...args),
}));

const context: TDrawSceneContext = {
  buffer: {} as WebGLBuffer,
  canvasHeight: 100,
  canvasWidth: 100,
  gl: {} as WebGL2RenderingContext,
  imageContext: {} as never,
  program: {} as WebGLProgram,
  viewport: { x: 0, y: 0, zoom: 1 },
};

describe('drawGridTrackAffordanceGrip', () => {
  beforeEach(() => {
    drawRotatedLineMock.mockClear();
  });

  it('should draw three vertical bars for a column pill', () => {
    drawGridTrackAffordanceGrip(context, { x: 50, y: 50 }, 'column', 0, { x: 0, y: 0 });

    expect(drawRotatedLineMock).toHaveBeenCalledTimes(3);
    drawRotatedLineMock.mock.calls.forEach(([, , , line]) => {
      expect(line.x1).toBe(line.x2);
      expect(line.y1).not.toBe(line.y2);
    });
  });

  it('should draw three horizontal bars for a row pill', () => {
    drawGridTrackAffordanceGrip(context, { x: 50, y: 50 }, 'row', 0, { x: 0, y: 0 });

    expect(drawRotatedLineMock).toHaveBeenCalledTimes(3);
    drawRotatedLineMock.mock.calls.forEach(([, , , line]) => {
      expect(line.y1).toBe(line.y2);
      expect(line.x1).not.toBe(line.x2);
    });
  });
});
