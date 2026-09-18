// types
import { NodeType, StrokeAlign } from 'types/design/enums';
import { TFrameNode } from 'types/design/types';

// utils
import { getStrokedRotatedNodeBounds } from '../getStrokedRotatedNodeBounds';
import { getStrokedSelectionBounds } from '../getStrokedSelectionBounds';

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

const outsideStroke = {
  strokeAlign: StrokeAlign.outside,
  strokeWidth: 8,
  strokes: [{ color: '#000', opacity: 100, type: 'solid' as const }],
};

describe('getStrokedRotatedNodeBounds', () => {
  it('should return the plain bounds without a stroke', () => {
    expect(getStrokedRotatedNodeBounds(buildFrame())).toEqual({ height: 50, width: 100, x: 10, y: 20 });
  });

  it('should include an outside stroke', () => {
    expect(getStrokedRotatedNodeBounds(buildFrame(outsideStroke))).toEqual({ height: 66, width: 116, x: 2, y: 12 });
  });

  it('should include the stroke of every node in a selection', () => {
    const bounds = getStrokedSelectionBounds([buildFrame(outsideStroke), buildFrame({ id: 'frame-2', x: 200, y: 20 })]);

    expect(bounds).toEqual({ height: 66, width: 298, x: 2, y: 12 });
  });
});
