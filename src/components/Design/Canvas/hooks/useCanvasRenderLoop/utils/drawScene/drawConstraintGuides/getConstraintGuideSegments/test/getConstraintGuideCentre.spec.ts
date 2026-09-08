// types
import { NodeType } from 'types/design/enums';
import { TRectangleNode } from 'types/design/types';

// utils
import { getConstraintGuideCentre } from '../getConstraintGuideCentre';

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
  it('should return the child box centre in world space', () => {
    expect(getConstraintGuideCentre(child())).toEqual({ x: 170, y: 150 });
  });

  it('should ignore the child’s own rotation, which turns about that same centre', () => {
    expect(getConstraintGuideCentre(child({ rotation: 45 }))).toEqual(getConstraintGuideCentre(child({ rotation: 0 })));
  });
});
