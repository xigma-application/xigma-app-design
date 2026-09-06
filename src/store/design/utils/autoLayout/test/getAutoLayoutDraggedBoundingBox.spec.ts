// types
import { NodeType } from 'types/design/enums';
import { TFrameNode, TRectangleNode } from 'types/design/types';

// utils
import { getAutoLayoutDraggedBoundingBox } from '../getAutoLayoutDraggedBoundingBox';

const rect = (id: string, x: number, y: number, width: number, height: number, rotation = 0): TRectangleNode => ({
  fill: '#000',
  height,
  id,
  name: 'Rectangle',
  parentId: null,
  rotation,
  type: NodeType.rectangle,
  width,
  x,
  y,
});

const frame = (rotation: number): TFrameNode => ({
  childIds: [],
  clipContent: true,
  fill: '#fff',
  height: 100,
  id: 'frame-1',
  name: 'Frame',
  parentId: null,
  rotation,
  type: NodeType.frame,
  width: 100,
  x: 0,
  y: 0,
});

describe('getAutoLayoutDraggedBoundingBox', () => {
  it('should union the plain bounds of every selected node when the frame has no rotation', () => {
    // action
    const box = getAutoLayoutDraggedBoundingBox([rect('a', 0, 0, 10, 10), rect('b', 20, 0, 10, 10)], frame(0));

    // result
    expect(box).toEqual({ height: 10, width: 30, x: 0, y: 0 });
  });

  it('should size a single dragged node by its rotation relative to the frame, not its absolute one', () => {
    // mock — a node that rigidly inherited the frame's own 90deg tilt reads as untilted (30x20, not
    // the 20x30 its absolute world bounding box would give)
    const tilted = rect('a', 0, 0, 30, 20, 90);

    // action
    const box = getAutoLayoutDraggedBoundingBox([tilted], frame(90));

    // result
    expect(box.width).toBe(30);
    expect(box.height).toBe(20);
  });
});
