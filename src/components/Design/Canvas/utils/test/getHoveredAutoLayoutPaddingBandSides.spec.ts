// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TFrameNode } from 'types/design/types';

// utils
import { getHoveredAutoLayoutPaddingBandSides } from '../getHoveredAutoLayoutPaddingBandSides';

const frame: TFrameNode = {
  childIds: [],
  clipContent: true,
  fill: '#fff',
  height: 200,
  id: 'frame-1',
  layoutMode: LayoutMode.horizontal,
  name: 'Frame',
  paddingLeft: 20,
  paddingTop: 12,
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 300,
  x: 0,
  y: 0,
};

describe('getHoveredAutoLayoutPaddingBandSides', () => {
  it('should return the side whose band contains the point', () => {
    expect(getHoveredAutoLayoutPaddingBandSides({ x: 10, y: 100 }, frame)).toEqual(['left']);
  });

  it('should return an empty array for a point in the frame interior, off every band', () => {
    expect(getHoveredAutoLayoutPaddingBandSides({ x: 150, y: 100 }, frame)).toEqual([]);
  });

  it('should return an empty array for a point outside the frame entirely', () => {
    expect(getHoveredAutoLayoutPaddingBandSides({ x: 900, y: 900 }, frame)).toEqual([]);
  });

  it('should never match a side whose padding is 0, even if the point sits right on the edge', () => {
    // right/bottom padding are unset (0), so their bands have zero width/height
    expect(getHoveredAutoLayoutPaddingBandSides({ x: 300, y: 100 }, frame)).toEqual([]);
    expect(getHoveredAutoLayoutPaddingBandSides({ x: 150, y: 200 }, frame)).toEqual([]);
  });

  it('should return both sides when the point sits in the overlap of two padded bands', () => {
    const cornerFrame: TFrameNode = { ...frame, paddingTop: 12 };

    expect(getHoveredAutoLayoutPaddingBandSides({ x: 10, y: 6 }, cornerFrame)).toEqual(['left', 'top']);
  });
});
