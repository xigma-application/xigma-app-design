// types
import { CanvasStacking, NodeType } from 'types/design/enums';
import { TFrameNode } from 'types/design/types';

// utils
import { getFrameChildIdsInPaintOrder } from '../getFrameChildIdsInPaintOrder';

const frame = (overrides: Partial<TFrameNode> = {}): TFrameNode => ({
  childIds: ['a', 'b', 'c'],
  clipContent: false,
  fill: '#fff',
  height: 100,
  id: 'frame-1',
  name: 'Frame',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 100,
  x: 0,
  y: 0,
  ...overrides,
});

describe('getFrameChildIdsInPaintOrder', () => {
  it('should return the childIds unchanged when canvas stacking is unset', () => {
    expect(getFrameChildIdsInPaintOrder(frame())).toEqual(['a', 'b', 'c']);
  });

  it('should return the childIds unchanged when last on top', () => {
    expect(getFrameChildIdsInPaintOrder(frame({ canvasStacking: CanvasStacking.lastOnTop }))).toEqual(['a', 'b', 'c']);
  });

  it('should reverse the childIds when first on top, without mutating the original array', () => {
    const original = frame({ canvasStacking: CanvasStacking.firstOnTop });

    expect(getFrameChildIdsInPaintOrder(original)).toEqual(['c', 'b', 'a']);
    expect(original.childIds).toEqual(['a', 'b', 'c']);
  });
});
