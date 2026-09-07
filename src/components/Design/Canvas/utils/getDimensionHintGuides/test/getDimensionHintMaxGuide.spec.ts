// utils
import { getDimensionHintMaxGuide } from '../getDimensionHintMaxGuide';

// types
import { TDimensionHintFrame } from '../types';

const frame: TDimensionHintFrame = { height: 200, width: 300, x: 100, y: 50 };

describe('getDimensionHintMaxGuide', () => {
  it('should draw nothing when no max bound is set', () => {
    expect(getDimensionHintMaxGuide(frame, true)).toEqual({ labels: [], lines: [] });
    expect(getDimensionHintMaxGuide(frame, false)).toEqual({ labels: [], lines: [] });
  });

  it('should draw nothing once the current width has reached the max', () => {
    expect(getDimensionHintMaxGuide({ ...frame, maxWidth: 300 }, true)).toEqual({ labels: [], lines: [] });
  });

  it('should draw nothing once the current height has reached the max', () => {
    expect(getDimensionHintMaxGuide({ ...frame, maxHeight: 200 }, false)).toEqual({ labels: [], lines: [] });
  });

  it('should build the max-width bracket when width is below max', () => {
    const guides = getDimensionHintMaxGuide({ ...frame, maxWidth: 500 }, true);

    expect(guides.lines).toEqual([
      { color: 'red', x1: 600, x2: 600, y1: 50, y2: 250 },
      { arrowAtEnd: true, color: 'blue', dashed: true, x1: 400, x2: 600, y1: 50, y2: 50 },
      { arrowAtEnd: true, color: 'blue', dashed: true, x1: 400, x2: 600, y1: 250, y2: 250 },
    ]);
    expect(guides.labels).toEqual([{ anchor: { x: 600, y: 150 }, color: 'red', offsetDirection: { x: 1, y: 0 }, text: 'Max W 500' }]);
  });

  it('should build the max-height bracket when height is below max', () => {
    const guides = getDimensionHintMaxGuide({ ...frame, maxHeight: 400 }, false);

    expect(guides.lines).toEqual([
      { color: 'red', x1: 100, x2: 400, y1: 450, y2: 450 },
      { arrowAtEnd: true, color: 'blue', dashed: true, x1: 100, x2: 100, y1: 250, y2: 450 },
      { arrowAtEnd: true, color: 'blue', dashed: true, x1: 400, x2: 400, y1: 250, y2: 450 },
    ]);
    expect(guides.labels).toEqual([{ anchor: { x: 250, y: 450 }, color: 'red', offsetDirection: { x: 0, y: 1 }, text: 'Max H 400' }]);
  });
});
