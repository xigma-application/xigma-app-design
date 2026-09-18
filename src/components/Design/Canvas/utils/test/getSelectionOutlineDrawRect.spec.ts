// types
import { NodeType, StrokeAlign, StrokeSides } from 'types/design/enums';
import { TFrameNode } from 'types/design/types';

// utils
import { getSelectionOutlineDrawRect } from '../getSelectionOutlineDrawRect';

const buildFrame = (overrides: Partial<TFrameNode> = {}): TFrameNode => ({
  childIds: [],
  clipContent: false,
  fills: [],
  height: 50,
  id: 'frame-1',
  name: 'Frame 1',
  parentId: null,
  rotation: 0,
  strokeAlign: StrokeAlign.outside,
  strokeSides: StrokeSides.top,
  strokeWidth: 10,
  strokes: [{ color: '#000', opacity: 100, type: 'solid' }],
  type: NodeType.frame,
  width: 100,
  x: 0,
  y: 0,
  ...overrides,
});

describe('getSelectionOutlineDrawRect', () => {
  it('should grow only the top edge for an unrotated top-only outside stroke', () => {
    expect(getSelectionOutlineDrawRect(buildFrame())).toEqual({ height: 60, width: 100, x: 0, y: -10 });
  });

  it('should move the padded rect centre with the rotation so drawing it about its own centre matches the node', () => {
    const rect = getSelectionOutlineDrawRect(buildFrame({ rotation: 90 }));

    expect(rect.width).toBe(100);
    expect(rect.height).toBe(60);
    expect(rect.x + rect.width / 2).toBeCloseTo(50 + 5, 5);
    expect(rect.y + rect.height / 2).toBeCloseTo(25, 5);
  });
});
