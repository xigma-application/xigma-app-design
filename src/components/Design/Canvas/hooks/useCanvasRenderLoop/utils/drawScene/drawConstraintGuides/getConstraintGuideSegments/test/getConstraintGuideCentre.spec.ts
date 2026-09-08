// types
import { NodeType } from 'types/design/enums';
import { TConstraintGuideParent } from '../types';
import { TRectangleNode } from 'types/design/types';

// utils
import { getConstraintGuideCentre } from '../getConstraintGuideCentre';
import { getNodePositionInParent } from 'store/design/utils/getNodePositionInParent';

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

describe('getConstraintGuideCentre', () => {
  it('should return the child’s box centre in world space for an axis-aligned frame', () => {
    expect(getConstraintGuideCentre(child(), parent)).toEqual({ x: 170, y: 150 });
  });

  it('should place the centre at the child box centre in the rotated frame’s local space', () => {
    const rotated: TConstraintGuideParent = { ...parent, rotation: 30 };
    const worldCentre = getConstraintGuideCentre(child(), rotated);

    // world → back into the frame's local space: it must land on the child's local top-left + half size
    const localCentre = getNodePositionInParent(worldCentre, rotated);
    const childLocal = getNodePositionInParent({ x: 150, y: 130 }, rotated);

    expect(localCentre.x).toBeCloseTo(childLocal.x + 20);
    expect(localCentre.y).toBeCloseTo(childLocal.y + 20);
  });

  it('should ignore the child’s own rotation', () => {
    expect(getConstraintGuideCentre(child({ rotation: 45 }), parent)).toEqual(getConstraintGuideCentre(child({ rotation: 0 }), parent));
  });
});
