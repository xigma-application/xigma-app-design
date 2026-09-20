// types
import { EffectType, NodeType } from 'types/design/enums';
import { TRectangleNode } from 'types/design/types';

// utils
import { createEffect } from 'utils/design/effects/createEffect';
import { getNodeGlass } from '../getNodeGlass';

const node: TRectangleNode = {
  fills: [],
  height: 40,
  id: 'r1',
  name: 'Rectangle',
  parentId: null,
  rotation: 0,
  type: NodeType.rectangle,
  width: 60,
  x: 0,
  y: 0,
};

describe('getNodeGlass', () => {
  it('should return the first visible glass effect', () => {
    // mock
    const effects = [createEffect(EffectType.dropShadow), createEffect(EffectType.glass)];

    // result
    expect(getNodeGlass({ ...node, effects })).toBe(effects[1]);
  });

  it('should return undefined for a hidden glass effect, other effect types, no effects, or a node type without effects', () => {
    // result
    expect(getNodeGlass({ ...node, effects: [{ ...createEffect(EffectType.glass), visible: false }] })).toBeUndefined();
    expect(getNodeGlass({ ...node, effects: [createEffect(EffectType.innerShadow)] })).toBeUndefined();
    expect(getNodeGlass(node)).toBeUndefined();
    expect(getNodeGlass({ ...node, type: NodeType.ellipse } as never)).toBeUndefined();
  });
});
