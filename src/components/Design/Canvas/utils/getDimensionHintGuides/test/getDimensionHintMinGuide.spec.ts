// utils
import { getDimensionHintMinGuide } from '../getDimensionHintMinGuide';

// types
import { TDimensionHintFrame } from '../types';

const frame: TDimensionHintFrame = { height: 200, width: 300, x: 100, y: 50 };

describe('getDimensionHintMinGuide', () => {
  it('should draw nothing when no min bound is set', () => {
    expect(getDimensionHintMinGuide(frame, true)).toEqual({ labels: [], lines: [] });
    expect(getDimensionHintMinGuide(frame, false)).toEqual({ labels: [], lines: [] });
  });

  it('should draw a vertical min-width guide under the frame', () => {
    const guides = getDimensionHintMinGuide({ ...frame, minWidth: 156 }, true);

    expect(guides.lines).toEqual([{ color: 'red', x1: 256, x2: 256, y1: 50, y2: 250 }]);
    expect(guides.labels).toEqual([{ anchor: { x: 256, y: 250 }, color: 'red', offsetDirection: { x: 0, y: 1 }, text: 'Min W 156' }]);
  });

  it('should draw a horizontal min-height guide to the right of the frame', () => {
    const guides = getDimensionHintMinGuide({ ...frame, minHeight: 80 }, false);

    expect(guides.lines).toEqual([{ color: 'red', x1: 100, x2: 400, y1: 130, y2: 130 }]);
    expect(guides.labels).toEqual([{ anchor: { x: 400, y: 130 }, color: 'red', offsetDirection: { x: 1, y: 0 }, text: 'Min H 80' }]);
  });

  it('should round a fractional min value in the label text', () => {
    const guides = getDimensionHintMinGuide({ ...frame, minWidth: 155.6 }, true);

    expect(guides.labels[0].text).toBe('Min W 156');
  });
});
