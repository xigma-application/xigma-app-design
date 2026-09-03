// types
import { NodeType } from 'types/design/enums';
import { TFrameNode } from 'types/design/types';

// utils
import { isPointOnFrameNameLabel } from '../isPointOnFrameNameLabel';

const frame = (overrides: Partial<TFrameNode> = {}): TFrameNode => ({
  childIds: [],
  clipContent: true,
  fill: '#ffffff',
  height: 300,
  id: 'frame-1',
  name: 'Frame',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 300,
  x: 1000,
  y: 1000,
  ...overrides,
});

describe('isPointOnFrameNameLabel', () => {
  it('should be true for a point on the label sitting just above the frame’s top-left corner', () => {
    // the label anchor is ~17px above (x, y) at zoom 1
    expect(isPointOnFrameNameLabel({ x: 1006, y: 990 }, frame(), 1)).toBe(true);
  });

  it('should be false for a point in the frame’s body', () => {
    expect(isPointOnFrameNameLabel({ x: 1150, y: 1150 }, frame(), 1)).toBe(false);
  });

  it('should be false for a point far above the frame, past the label', () => {
    expect(isPointOnFrameNameLabel({ x: 1006, y: 900 }, frame(), 1)).toBe(false);
  });

  it('should be false when the frame has no name (no label is drawn)', () => {
    expect(isPointOnFrameNameLabel({ x: 1006, y: 990 }, frame({ name: '' }), 1)).toBe(false);
  });
});
