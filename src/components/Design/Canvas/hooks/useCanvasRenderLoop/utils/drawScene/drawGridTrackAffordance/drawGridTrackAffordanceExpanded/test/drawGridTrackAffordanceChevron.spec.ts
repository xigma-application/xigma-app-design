// types
import { TDrawSceneContext } from '../../../types';

// utils
import { drawGridTrackAffordanceChevron } from '../drawGridTrackAffordanceChevron';

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

describe('drawGridTrackAffordanceChevron', () => {
  beforeEach(() => {
    drawRotatedLineMock.mockClear();
  });

  it('should draw a downward-pointing "v" as two segments meeting at the bottom center', () => {
    drawGridTrackAffordanceChevron(context, { x: 50, y: 50 }, 0, { x: 0, y: 0 });

    expect(drawRotatedLineMock).toHaveBeenCalledTimes(2);

    const [firstLine] = drawRotatedLineMock.mock.calls[0].slice(3);
    const [secondLine] = drawRotatedLineMock.mock.calls[1].slice(3);

    expect(firstLine.x2).toBe(50);
    expect(secondLine.x1).toBe(50);
    expect(firstLine.y2).toBe(secondLine.y1);
    expect(firstLine.y2).toBeGreaterThan(firstLine.y1);
    expect(secondLine.y1).toBeGreaterThan(secondLine.y2);
  });
});
