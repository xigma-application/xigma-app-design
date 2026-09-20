// types
import { EffectBlurType, EffectType, NodeType } from 'types/design/enums';
import { TRectangleNode } from 'types/design/types';

// utils
import { createEffect } from 'utils/design/effects/createEffect';
import { getNodeBackgroundBlur } from '../getNodeBackgroundBlur';

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

describe('getNodeBackgroundBlur', () => {
  it('should return the background blur amount and ignore a layer blur', () => {
    // mock
    const effects = [
      { ...createEffect(EffectType.layerBlur), blur: 3 },
      { ...createEffect(EffectType.backgroundBlur), blur: 12 },
    ];

    // result
    expect(getNodeBackgroundBlur({ ...node, effects })).toBe(12);
    expect(getNodeBackgroundBlur({ ...node, effects: [effects[0]] })).toBe(0);
  });

  it('should use the larger of the start and end blur for a progressive background blur', () => {
    // mock
    const effects = [{ ...createEffect(EffectType.backgroundBlur), blur: 2, blurType: EffectBlurType.progressive, startBlur: 7 }];

    // result
    expect(getNodeBackgroundBlur({ ...node, effects })).toBe(7);
  });
});
