// types
import { AlignmentHorizontal, AlignmentVertical, NodeType } from 'types/design/enums';
import { TConstraintGuideParent } from '../types';
import { TRectangleNode } from 'types/design/types';

// utils
import { getConstraintGuideSegments } from '../getConstraintGuideSegments';
import { rotatePoint } from 'utils/math/rotatePoint';

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

describe('getConstraintGuideSegments', () => {
  it('should draw left + top edge lines for an unset alignment (the effective default)', () => {
    const [horizontal, vertical] = getConstraintGuideSegments(child(), parent, undefined);

    // child left-edge midpoint (150, 150) → frame left edge (100, 150)
    expect(horizontal).toEqual({ x1: 150, x2: 100, y1: 150, y2: 150 });
    // child top-edge midpoint (170, 130) → frame top edge (170, 100)
    expect(vertical).toEqual({ x1: 170, x2: 170, y1: 130, y2: 100 });
  });

  it('should draw to the right and bottom frame edges for right + bottom', () => {
    const [horizontal, vertical] = getConstraintGuideSegments(child(), parent, {
      horizontal: AlignmentHorizontal.right,
      vertical: AlignmentVertical.bottom,
    });

    expect(horizontal).toEqual({ x1: 190, x2: 500, y1: 150, y2: 150 });
    expect(vertical).toEqual({ x1: 170, x2: 170, y1: 170, y2: 300 });
  });

  it('should draw centre lines of length width/2 and height/2 centred on the child centre', () => {
    const [horizontal, vertical] = getConstraintGuideSegments(child(), parent, {
      horizontal: AlignmentHorizontal.center,
      vertical: AlignmentVertical.center,
    });

    // child centre world = (170, 150); w/2 = 20 → 160..180, h/2 = 20 → 140..160
    expect(horizontal).toEqual({ x1: 160, x2: 180, y1: 150, y2: 150 });
    expect(vertical).toEqual({ x1: 170, x2: 170, y1: 140, y2: 160 });
    expect(Math.abs(horizontal.x2 - horizontal.x1)).toBe(20);
    expect(Math.abs(vertical.y2 - vertical.y1)).toBe(20);
  });

  it('should run guide lines along the rotated frame’s own axes', () => {
    const rotatedParent: TConstraintGuideParent = { ...parent, rotation: 30 };
    const centre = { x: parent.x + parent.width / 2, y: parent.y + parent.height / 2 };
    const [horizontal] = getConstraintGuideSegments(child(), rotatedParent, undefined); // 'left' → the frame's local x axis

    // at 30° the segment is not axis-aligned in world space...
    expect(horizontal.y1).not.toBeCloseTo(horizontal.y2);

    // ...but un-rotating both endpoints by the frame's rotation makes it a flat horizontal line
    const from = rotatePoint({ x: horizontal.x1, y: horizontal.y1 }, centre, -30);
    const to = rotatePoint({ x: horizontal.x2, y: horizontal.y2 }, centre, -30);

    expect(from.y).toBeCloseTo(to.y);
  });

  it('should anchor the edge line to the child’s current rotated extent, not its un-rotated box', () => {
    const flat = getConstraintGuideSegments(child({ rotation: 0 }), parent, { horizontal: AlignmentHorizontal.left });
    const spun = getConstraintGuideSegments(child({ rotation: 30 }), parent, { horizontal: AlignmentHorizontal.left });

    // rotating the child widens its horizontal extent, so the near end sits further left
    expect(spun[0].x1).toBeLessThan(flat[0].x1);
    // the far end still lands on the frame's left edge
    expect(spun[0].x2).toBeCloseTo(flat[0].x2);
  });

  it('should keep the line axis-aligned to the frame even when the child is rotated', () => {
    const [horizontal, vertical] = getConstraintGuideSegments(child({ rotation: 30 }), parent, {
      horizontal: AlignmentHorizontal.left,
      vertical: AlignmentVertical.top,
    });

    expect(horizontal.y1).toBeCloseTo(horizontal.y2);
    expect(vertical.x1).toBeCloseTo(vertical.x2);
  });
});
