// utils
import { drawArcSpokes } from '../drawArcSpokes';

const drawLineMock = vi.fn();

vi.mock('../../drawLine', () => ({
  drawLine: (...args: unknown[]): unknown => drawLineMock(...args),
}));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

describe('drawArcSpokes', () => {
  beforeEach(() => {
    drawLineMock.mockClear();
  });

  it('should draw a line from each spoke start to its matching rim point', () => {
    // mock
    const firstSpokeStart = { x: 0, y: 0 };
    const firstRimPoint = { x: 10, y: 0 };
    const lastSpokeStart = { x: 0, y: 0 };
    const lastRimPoint = { x: 0, y: 10 };

    // before
    drawArcSpokes(
      {} as WebGL2RenderingContext,
      {} as WebGLProgram,
      {} as WebGLBuffer,
      firstSpokeStart,
      firstRimPoint,
      lastSpokeStart,
      lastRimPoint,
      '#0d99ff',
      2,
      100,
      100,
      IDENTITY_VIEWPORT,
    );

    // result
    expect(drawLineMock).toHaveBeenCalledTimes(2);
    expect(drawLineMock).toHaveBeenNthCalledWith(
      1,
      {},
      {},
      {},
      { x1: firstSpokeStart.x, x2: firstRimPoint.x, y1: firstSpokeStart.y, y2: firstRimPoint.y },
      '#0d99ff',
      2,
      100,
      100,
      IDENTITY_VIEWPORT,
    );
    expect(drawLineMock).toHaveBeenNthCalledWith(
      2,
      {},
      {},
      {},
      { x1: lastSpokeStart.x, x2: lastRimPoint.x, y1: lastSpokeStart.y, y2: lastRimPoint.y },
      '#0d99ff',
      2,
      100,
      100,
      IDENTITY_VIEWPORT,
    );
  });
});
