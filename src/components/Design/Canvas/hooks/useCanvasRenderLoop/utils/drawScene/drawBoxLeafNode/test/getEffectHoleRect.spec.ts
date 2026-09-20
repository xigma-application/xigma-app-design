// types
import { EffectType, NodeType } from 'types/design/enums';
import { TEffect, TRectangleNode } from 'types/design/types';

// utils
import { createEffect } from 'utils/design/effects/createEffect';
import { getEffectHoleRect } from '../getEffectHoleRect';

const node: TRectangleNode = {
  cornerRadius: 10,
  cornerRadiusTopLeft: 3,
  fills: [],
  height: 60,
  id: 'r1',
  name: 'Rectangle',
  parentId: null,
  rotation: 0,
  type: NodeType.rectangle,
  width: 100,
  x: 300,
  y: 400,
};

const build = (overrides: Partial<TEffect>): TEffect => ({ ...createEffect(EffectType.innerShadow), ...overrides });

describe('getEffectHoleRect', () => {
  it('should shift the shape by the effect offset from the margin', () => {
    // Step 1: Offset only
    const rect = getEffectHoleRect(node, build({ spread: 0, x: 3, y: 5 }), 8);

    // Step 2: Assert
    expect(rect).toMatchObject({ height: 60, width: 100, x: 11, y: 13 });
  });

  it('should shrink the hole and its corners by the spread on every side', () => {
    // Step 1: Spread only
    const rect = getEffectHoleRect(node, build({ spread: 4, x: 0, y: 0 }), 8);

    // Step 2: Assert
    expect(rect).toMatchObject({
      cornerRadiusBottomLeft: 6,
      cornerRadiusTopLeft: 0,
      height: 52,
      width: 92,
      x: 12,
      y: 12,
    });
  });

  it('should collapse to an empty hole when the spread is larger than half the size', () => {
    // Step 1: Huge spread
    const rect = getEffectHoleRect(node, build({ spread: 500 }), 8);

    // Step 2: Assert
    expect(rect.width).toBe(0);
    expect(rect.height).toBe(0);
  });
});
