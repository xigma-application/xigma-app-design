// types
import { NodeType, StrokeAlign } from 'types/design/enums';
import { TFrameNode } from 'types/design/types';

// utils
import { getSelectionOutlineBounds } from '../getSelectionOutlineBounds';

const buildFrame = (overrides: Partial<TFrameNode> = {}): TFrameNode => ({
  childIds: [],
  clipContent: false,
  fills: [],
  height: 50,
  id: 'frame-1',
  name: 'Frame 1',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 100,
  x: 10,
  y: 20,
  ...overrides,
});

describe('getSelectionOutlineBounds', () => {
  it('should return the plain bounds when the node has no stroke', () => {
    expect(getSelectionOutlineBounds(buildFrame())).toEqual({ height: 50, width: 100, x: 10, y: 20 });
  });

  it('should grow by the full stroke width for an outside stroke paint', () => {
    const frame = buildFrame({
      strokeAlign: StrokeAlign.outside,
      strokeWidth: 8,
      strokes: [{ color: '#000', opacity: 100, type: 'solid' }],
    });

    expect(getSelectionOutlineBounds(frame)).toEqual({ height: 66, width: 116, x: 2, y: 12 });
  });

  it('should grow by half the stroke width for a center stroke paint', () => {
    const frame = buildFrame({
      strokeAlign: StrokeAlign.center,
      strokeWidth: 8,
      strokes: [{ color: '#000', opacity: 100, type: 'solid' }],
    });

    expect(getSelectionOutlineBounds(frame)).toEqual({ height: 58, width: 108, x: 6, y: 16 });
  });

  it('should not grow for an inside stroke paint', () => {
    const frame = buildFrame({
      strokeAlign: StrokeAlign.inside,
      strokeWidth: 8,
      strokes: [{ color: '#000', opacity: 100, type: 'solid' }],
    });

    expect(getSelectionOutlineBounds(frame)).toEqual({ height: 50, width: 100, x: 10, y: 20 });
  });
});
