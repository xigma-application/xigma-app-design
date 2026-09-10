// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TFrameNode, TRectangleNode } from 'types/design/types';

// utils
import { isGridFrame } from '../isGridFrame';

const frame: TFrameNode = {
  childIds: [],
  clipContent: true,
  fill: '#fff',
  height: 100,
  id: 'f1',
  layoutMode: LayoutMode.grid,
  name: 'Frame',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 100,
  x: 0,
  y: 0,
};

const rectangle: TRectangleNode = {
  fill: '#000',
  height: 10,
  id: 'r1',
  name: 'Rectangle',
  parentId: null,
  rotation: 0,
  type: NodeType.rectangle,
  width: 10,
  x: 0,
  y: 0,
};

describe('isGridFrame', () => {
  it('should be true for a grid-mode frame', () => {
    expect(isGridFrame(frame)).toBe(true);
  });

  it('should be false for null', () => {
    expect(isGridFrame(null)).toBe(false);
  });

  it('should be false for a non-grid frame', () => {
    expect(isGridFrame({ ...frame, layoutMode: LayoutMode.horizontal })).toBe(false);
  });

  it('should be false for a non-frame node', () => {
    expect(isGridFrame(rectangle)).toBe(false);
  });
});
