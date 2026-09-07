// utils
import { getDimensionHintEdgeGuide } from '../getDimensionHintEdgeGuide';

// types
import { TDimensionHintFrame } from '../types';

const frame: TDimensionHintFrame = { height: 200, width: 300, x: 100, y: 50 };

describe('getDimensionHintEdgeGuide', () => {
  it('should draw the right-edge line for width', () => {
    const guides = getDimensionHintEdgeGuide(frame, true);

    expect(guides).toEqual({ labels: [], lines: [{ color: 'blue', x1: 400, x2: 400, y1: 50, y2: 250 }] });
  });

  it('should draw the bottom-edge line for height', () => {
    const guides = getDimensionHintEdgeGuide(frame, false);

    expect(guides).toEqual({ labels: [], lines: [{ color: 'blue', x1: 100, x2: 400, y1: 250, y2: 250 }] });
  });
});
