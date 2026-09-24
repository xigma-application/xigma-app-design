// types
import { TRectangleNode } from 'types/design/types';

// utils
import { hasRoundedCorner } from '../hasRoundedCorner';

const createNode = (overrides: Record<string, unknown> = {}): TRectangleNode =>
  ({
    fills: [],
    height: 10,
    id: 'r',
    name: 'r',
    parentId: null,
    rotation: 0,
    type: 'rectangle',
    width: 10,
    x: 0,
    y: 0,
    ...overrides,
  }) as unknown as TRectangleNode;

describe('hasRoundedCorner', () => {
  it('should be false for a square-cornered rectangle', () => {
    // result
    expect(hasRoundedCorner(createNode())).toBe(false);
    expect(hasRoundedCorner(createNode({ cornerRadius: 0 }))).toBe(false);
  });

  it.each(['cornerRadius', 'cornerRadiusTopLeft', 'cornerRadiusTopRight', 'cornerRadiusBottomLeft', 'cornerRadiusBottomRight'])(
    'should be true when %s is set',
    (field) => {
      // result
      expect(hasRoundedCorner(createNode({ [field]: 4 }))).toBe(true);
    },
  );
});
