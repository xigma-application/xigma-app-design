// types
import { NodeType } from 'types/design/enums';
import { TConstraintGuideParent } from '../types';
import { TRectangleNode } from 'types/design/types';

// utils
import { getChildLocalExtent } from '../getChildLocalExtent';

const parent: TConstraintGuideParent = { height: 200, rotation: 0, width: 400, x: 100, y: 100 };

const child = (overrides: Partial<TRectangleNode> = {}): TRectangleNode => ({
  fill: '#000',
  height: 40,
  id: 'r1',
  name: 'Rectangle',
  parentId: 'frame-1',
  rotation: 0,
  type: NodeType.rectangle,
  width: 40,
  x: 150,
  y: 130,
  ...overrides,
});

describe('getChildLocalExtent', () => {
  it('should map the child box centre into the frame-local space', () => {
    const { centre } = getChildLocalExtent(child(), parent);

    // world centre (170, 150) → local (70, 50) for an unrotated frame at (100, 100)
    expect(centre).toEqual({ x: 70, y: 50 });
  });

  it('should use half the width/height when neither the child nor the frame is rotated', () => {
    const { halfX, halfY } = getChildLocalExtent(child(), parent);

    expect(halfX).toBe(20);
    expect(halfY).toBe(20);
  });

  it('should grow the axis half-extents as the child rotates', () => {
    const { halfX, halfY } = getChildLocalExtent(child({ rotation: 45 }), parent);

    // a 40×40 square at 45°: the guide ray from the centre reaches the edge at 20 / cos 45°
    expect(halfX).toBeCloseTo(20 / Math.cos(Math.PI / 4));
    expect(halfY).toBeCloseTo(20 / Math.cos(Math.PI / 4));
  });

  it('should cancel the frame rotation against an equal child rotation', () => {
    const rotatedFrame: TConstraintGuideParent = { ...parent, rotation: 30 };
    const { halfX, halfY } = getChildLocalExtent(child({ rotation: 30 }), rotatedFrame);

    expect(halfX).toBeCloseTo(20);
    expect(halfY).toBeCloseTo(20);
  });

  it('should govern each axis by the opposite half-size for a non-square child turned 90°', () => {
    const { halfX, halfY } = getChildLocalExtent(child({ height: 20, rotation: 90, width: 80 }), parent);

    expect(halfX).toBeCloseTo(10);
    expect(halfY).toBeCloseTo(40);
  });
});
