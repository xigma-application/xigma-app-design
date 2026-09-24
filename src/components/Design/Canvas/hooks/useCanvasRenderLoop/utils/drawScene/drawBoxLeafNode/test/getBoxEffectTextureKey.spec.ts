// types
import { EffectType, NodeType } from 'types/design/enums';
import { TRectangleNode } from 'types/design/types';

// utils
import { createEffect } from 'utils/design/effects/createEffect';
import { getBoxEffectTextureKey } from '../getBoxEffectTextureKey';

const node: TRectangleNode = {
  cornerRadius: 4,
  fills: [],
  height: 40,
  id: 'r1',
  name: 'Rectangle',
  parentId: null,
  rotation: 0,
  type: NodeType.rectangle,
  width: 60,
  x: 100,
  y: 200,
};

describe('getBoxEffectTextureKey', () => {
  it('should ignore position, rotation and opacity so moved or rotated copies share one texture', () => {
    // mock
    const effect = createEffect(EffectType.dropShadow);

    // before
    const first = getBoxEffectTextureKey(EffectType.dropShadow, node, effect);
    const second = getBoxEffectTextureKey(EffectType.dropShadow, { ...node, rotation: 30, x: 5, y: 9 }, { ...effect, opacity: 10 });

    // result
    expect(second).toBe(first);
  });

  it.each([
    ['width', { width: 61 }],
    ['height', { height: 41 }],
    ['corner radius', { cornerRadius: 5 }],
    ['corner smoothing', { cornerSmoothing: 0.6 }],
    ['a corner override', { cornerRadiusTopLeft: 9 }],
  ])('should produce a different key when the node %s changes', (_label, patch) => {
    // mock
    const effect = createEffect(EffectType.dropShadow);

    // result
    expect(getBoxEffectTextureKey(EffectType.dropShadow, { ...node, ...patch }, effect)).not.toBe(
      getBoxEffectTextureKey(EffectType.dropShadow, node, effect),
    );
  });

  it.each([
    ['color', { color: '#ff0000' }],
    ['blur', { blur: 21 }],
    ['spread', { spread: 3 }],
    ['x offset', { x: 7 }],
    ['y offset', { y: 7 }],
  ])('should produce a different key when the effect %s changes', (_label, patch) => {
    // mock
    const effect = createEffect(EffectType.dropShadow);

    // result
    expect(getBoxEffectTextureKey(EffectType.dropShadow, node, { ...effect, ...patch })).not.toBe(
      getBoxEffectTextureKey(EffectType.dropShadow, node, effect),
    );
  });

  it('should separate drop shadow and inner shadow textures', () => {
    // mock
    const effect = createEffect(EffectType.dropShadow);

    // result
    expect(getBoxEffectTextureKey(EffectType.innerShadow, node, effect)).not.toBe(
      getBoxEffectTextureKey(EffectType.dropShadow, node, effect),
    );
  });
});
