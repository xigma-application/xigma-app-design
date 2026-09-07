// types
import { TDrawSceneContext } from '../../types';

// utils
import { drawAutoLayoutGapHandleBars } from '../drawAutoLayoutGapHandleBars';

const drawAutoLayoutGapHandleBarMock = vi.fn();

vi.mock('../drawAutoLayoutGapHandleBar', () => ({
  drawAutoLayoutGapHandleBar: (...args: unknown[]): void => drawAutoLayoutGapHandleBarMock(...args),
}));

const context = {} as TDrawSceneContext;
const frameCenter = { x: 100, y: 50 };

describe('drawAutoLayoutGapHandleBars', () => {
  beforeEach(() => {
    drawAutoLayoutGapHandleBarMock.mockClear();
  });

  it('should draw a vertical bar for every horizontal-axis handle and a horizontal bar for every vertical-axis handle', () => {
    // mock
    const horizontalFillRect = { height: 50, width: 20, x: 50, y: 0 };
    const verticalFillRect = { height: 20, width: 120, x: 0, y: 50 };

    // before
    drawAutoLayoutGapHandleBars(context, { horizontal: [horizontalFillRect], vertical: [verticalFillRect] }, frameCenter, 0);

    // result
    expect(drawAutoLayoutGapHandleBarMock).toHaveBeenCalledTimes(2);
    expect(drawAutoLayoutGapHandleBarMock).toHaveBeenCalledWith(context, horizontalFillRect, 'vertical', frameCenter, 0);
    expect(drawAutoLayoutGapHandleBarMock).toHaveBeenCalledWith(context, verticalFillRect, 'horizontal', frameCenter, 0);
  });

  it('should draw nothing when there are no handles', () => {
    // before
    drawAutoLayoutGapHandleBars(context, { horizontal: [], vertical: [] }, frameCenter, 0);

    // result
    expect(drawAutoLayoutGapHandleBarMock).not.toHaveBeenCalled();
  });
});
