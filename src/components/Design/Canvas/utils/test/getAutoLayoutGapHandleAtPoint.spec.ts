// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TFrameNode, TRectangleNode } from 'types/design/types';

// utils
import { getAutoLayoutGapHandleAtPoint } from '../getAutoLayoutGapHandleAtPoint';

const rect = (x: number, y: number): TRectangleNode => ({
  fill: '#000',
  height: 50,
  id: `rect-${x}-${y}`,
  name: 'Rectangle',
  parentId: 'frame-1',
  rotation: 0,
  type: NodeType.rectangle,
  width: 50,
  x,
  y,
});

const frame: TFrameNode = {
  childIds: [],
  clipContent: true,
  fill: '#fff',
  height: 200,
  id: 'frame-1',
  layoutMode: LayoutMode.horizontal,
  name: 'Frame',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 300,
  x: 0,
  y: 0,
};

const children = [rect(0, 0), rect(70, 0)];

describe('getAutoLayoutGapHandleAtPoint', () => {
  it('should hit the horizontal handle when the point sits within tolerance of its centre', () => {
    // action
    const hit = getAutoLayoutGapHandleAtPoint({ x: 60, y: 25 }, frame, children, 6);

    // result
    expect(hit).toEqual({ axis: 'horizontal', fillRect: { height: 50, width: 20, x: 50, y: 0 } });
  });

  it('should return null when the point is outside every handle’s tolerance', () => {
    // action
    const hit = getAutoLayoutGapHandleAtPoint({ x: 200, y: 25 }, frame, children, 6);

    // result
    expect(hit).toBeNull();
  });

  it('should hit the vertical handle when no horizontal handle matches', () => {
    // mock — a wrapped column layout, point over the row-gap band
    const wrappedFrame: TFrameNode = { ...frame, layoutWrap: true };
    const wrappedChildren = [rect(0, 0), rect(70, 0), rect(0, 70)];

    // action
    const hit = getAutoLayoutGapHandleAtPoint({ x: 60, y: 60 }, wrappedFrame, wrappedChildren, 6);

    // result
    expect(hit).toEqual({ axis: 'vertical', fillRect: { height: 20, width: 120, x: 0, y: 50 } });
  });
});
