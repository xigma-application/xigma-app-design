// types
import { NodeType } from 'types/design/enums';
import { TFrameNode, TRectangleNode } from 'types/design/types';

// utils
import { getAutoLayoutNodeLocalBounds } from '../getAutoLayoutNodeLocalBounds';

const rect = (x: number, y: number, rotation = 0): TRectangleNode => ({
  fill: '#000',
  height: 20,
  id: 'a',
  name: 'Rectangle',
  parentId: 'frame-1',
  rotation,
  type: NodeType.rectangle,
  width: 30,
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

describe('getAutoLayoutNodeLocalBounds', () => {
  it('should return the plain bounds unchanged when the frame has no rotation', () => {
    // action
    const bounds = getAutoLayoutNodeLocalBounds(rect(10, 10), frame(0));

    // result
    expect(bounds).toEqual({ height: 20, width: 30, x: 10, y: 10 });
  });

  it('should un-rotate a sibling’s world position back around the frame’s own centre', () => {
    // mock — a child that rigidly orbited to the top-right corner of a 100x100 frame rotated 90deg
    // (frame centre 50,50) — the same fixture as syncAutoLayoutChildren's own orbit test, inverted
    const child = rect(70, 0);
    const parent = frame(90);

    // action
    const bounds = getAutoLayoutNodeLocalBounds(child, parent);

    // result — back to sitting flush at the frame's own (un-rotated) top-left, with the swapped
    // 20x30 footprint (child stays axis-aligned in world space, so relative to the frame it's tilted)
    expect(bounds.x).toBeCloseTo(0, 0);
    expect(bounds.y).toBeCloseTo(0, 0);
    expect(bounds.width).toBe(20);
    expect(bounds.height).toBe(30);
  });

  it('should leave a child that rigidly shares the frame’s own rotation reading as flush and un-swapped', () => {
    // mock — child and frame share the same rotation (as continueRotateDrag/rotateNodesRigidly leave
    // them): relative tilt is 0, so no width/height swap
    const child = rect(0, 0, 45);
    const parent = frame(45);

    // action
    const bounds = getAutoLayoutNodeLocalBounds(child, parent);

    // result
    expect(bounds.width).toBe(30);
    expect(bounds.height).toBe(20);
  });
});
