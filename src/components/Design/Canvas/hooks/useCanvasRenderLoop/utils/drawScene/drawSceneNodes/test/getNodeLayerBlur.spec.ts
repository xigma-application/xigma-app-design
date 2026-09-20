// types
import { EffectBlurType, EffectType, NodeType } from 'types/design/enums';
import { TRectangleNode } from 'types/design/types';

// utils
import { createEffect } from 'utils/design/effects/createEffect';
import { getNodeLayerBlur } from '../getNodeLayerBlur';

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

describe('getNodeLayerBlur', () => {
  it('should return the blur of the first visible layer blur effect', () => {
    // mock
    const effects = [createEffect(EffectType.dropShadow), { ...createEffect(EffectType.layerBlur), blur: 12 }];

    // result
    expect(getNodeLayerBlur({ ...node, effects })).toBe(12);
  });

  it('should return 0 for a hidden layer blur, other effect types, no effects, or a node type without effects', () => {
    // result
    expect(getNodeLayerBlur({ ...node, effects: [{ ...createEffect(EffectType.layerBlur), visible: false }] })).toBe(0);
    expect(getNodeLayerBlur({ ...node, effects: [createEffect(EffectType.innerShadow)] })).toBe(0);
    expect(getNodeLayerBlur(node)).toBe(0);
    expect(getNodeLayerBlur({ ...node, type: NodeType.ellipse } as never)).toBe(0);
  });

  it('should use the larger of the start and end blur for a progressive layer blur', () => {
    // mock
    const effects = [{ ...createEffect(EffectType.layerBlur), blur: 4, blurType: EffectBlurType.progressive, startBlur: 9 }];

    // result
    expect(getNodeLayerBlur({ ...node, effects })).toBe(9);
  });
});
