// types
import { EffectType, NodeType } from 'types/design/enums';
import { TEffect, TRectangleNode } from 'types/design/types';

// utils
import { createEffect } from 'utils/design/effects/createEffect';
import { getDropShadowRect } from '../getDropShadowRect';

const node: TRectangleNode = {
  cornerRadius: 10,
  cornerRadiusTopLeft: 0,
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

const build = (overrides: Partial<TEffect>): TEffect => ({ ...createEffect(EffectType.dropShadow), ...overrides });

describe('getDropShadowRect', () => {
  it('should shift the shape by the offset from the margin', () => {
    // result
    expect(getDropShadowRect(node, build({ spread: 0, x: 3, y: 5 }), 8)).toMatchObject({ height: 60, width: 100, x: 11, y: 13 });
  });

  it('should grow the shape and its corners by the spread on every side', () => {
    // result
    expect(getDropShadowRect(node, build({ spread: 4, x: 0, y: 0 }), 8)).toMatchObject({
      cornerRadiusBottomLeft: 14,
      cornerRadiusTopLeft: 4,
      height: 68,
      width: 108,
      x: 4,
      y: 4,
    });
  });

  it('should never go below zero size for a large negative spread', () => {
    // result
    expect(getDropShadowRect(node, build({ spread: -40, x: 0, y: 0 }), 8)).toMatchObject({ height: 0, width: 20 });
  });
});
