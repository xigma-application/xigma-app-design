// types
import { EffectType, NodeType } from 'types/design/enums';
import { TRectangleNode } from 'types/design/types';

// utils
import { createEffect } from 'utils/design/effects/createEffect';
import { getNodeEffectOfType } from '../getNodeEffectOfType';

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

describe('getNodeEffectOfType', () => {
  it('should return the first visible effect of the requested type', () => {
    // mock
    const hidden = { ...createEffect(EffectType.backgroundBlur), visible: false };
    const shown = { ...createEffect(EffectType.backgroundBlur), blur: 9 };

    // result
    expect(getNodeEffectOfType({ ...node, effects: [createEffect(EffectType.layerBlur), hidden, shown] }, EffectType.backgroundBlur)).toBe(
      shown,
    );
  });

  it('should return undefined when there is no such effect or the node has no effects', () => {
    // result
    expect(getNodeEffectOfType(node, EffectType.layerBlur)).toBeUndefined();
    expect(getNodeEffectOfType({ ...node, effects: [createEffect(EffectType.dropShadow)] }, EffectType.layerBlur)).toBeUndefined();
    expect(getNodeEffectOfType({ ...node, type: NodeType.ellipse } as never, EffectType.layerBlur)).toBeUndefined();
  });
});
