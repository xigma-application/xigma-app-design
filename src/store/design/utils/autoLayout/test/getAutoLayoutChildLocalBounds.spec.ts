// types
import { NodeType } from 'types/design/enums';
import { TLineNode, TRectangleNode } from 'types/design/types';

// utils
import { getAutoLayoutChildLocalBounds } from '../getAutoLayoutChildLocalBounds';

const rect = (rotation: number): TRectangleNode => ({
  fill: '#000',
  height: 20,
  id: 'a',
  name: 'Rectangle',
  parentId: null,
  rotation,
  type: NodeType.rectangle,
  width: 30,
  x: 0,
  y: 0,
});

const line: TLineNode = { id: 'b', name: 'Line', parentId: null, stroke: '#000', type: NodeType.line, x1: 0, x2: 20, y1: 0, y2: 0 };

describe('getAutoLayoutChildLocalBounds', () => {
  it('should return the node’s plain (absolute-rotation) bounds when the frame itself has no rotation', () => {
    // action
    const bounds = getAutoLayoutChildLocalBounds(rect(45), 0);

    // result — 30x20 tilted 45deg has a bigger, non-30x20 AABB
    expect(bounds.width).not.toBe(30);
    expect(bounds.height).not.toBe(20);
  });

  it('should net out the frame’s own rotation, so a child that stays axis-aligned in world space swaps footprint dimensions', () => {
    // action — child at absolute rotation 0, frame rotated 90deg: relative tilt is -90deg
    const bounds = getAutoLayoutChildLocalBounds(rect(0), 90);

    // result — a 30x20 box viewed 90deg off-axis reads as 20x30
    expect(bounds.width).toBe(20);
    expect(bounds.height).toBe(30);
  });

  it('should treat a child that already rigidly inherited the frame’s own rotation as un-tilted relative to it', () => {
    // action — child and frame share the same absolute rotation: relative tilt is 0
    const bounds = getAutoLayoutChildLocalBounds(rect(45), 45);

    // result — the real, un-inflated 30x20 footprint
    expect(bounds).toMatchObject({ height: 20, width: 30 });
  });

  it('should fall back to the plain bounds for a node type with no rotation field (a line)', () => {
    // action / result — must not throw reading `.rotation` off a line
    expect(() => getAutoLayoutChildLocalBounds(line, 90)).not.toThrow();
  });
});
