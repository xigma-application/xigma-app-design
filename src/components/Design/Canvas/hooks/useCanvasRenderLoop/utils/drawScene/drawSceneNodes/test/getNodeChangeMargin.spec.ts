// types
import { EffectType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { createEffect } from 'utils/design/effects/createEffect';
import { getNodeChangeMargin } from '../getNodeChangeMargin';

const createNode = (extra: Record<string, unknown> = {}): TSceneNode =>
  ({ height: 10, id: 'n', type: 'rectangle', width: 10, x: 0, y: 0, ...extra }) as unknown as TSceneNode;

describe('getNodeChangeMargin', () => {
  it('should be zero for a node without effects or stroke', () => {
    // result
    expect(getNodeChangeMargin(createNode())).toBe(0);
  });

  it('should be zero for a node type that has no effects field', () => {
    // result
    expect(getNodeChangeMargin({ id: 't', type: 'text' } as unknown as TSceneNode)).toBe(0);
  });

  it('should include the stroke width', () => {
    // result
    expect(getNodeChangeMargin(createNode({ strokeWidth: 6 }))).toBe(6);
  });

  it('should cover a drop shadow reach plus its blur', () => {
    // mock
    const effect = { ...createEffect(EffectType.dropShadow), blur: 10, spread: 0, x: 0, y: 20 };

    // result
    expect(getNodeChangeMargin(createNode({ effects: [effect] }))).toBeGreaterThanOrEqual(30);
  });

  it('should add the texture radius and the glass reach', () => {
    // mock
    const texture = { ...createEffect(EffectType.texture), blur: 0, radius: 12, x: 0, y: 0 };
    const glass = { ...createEffect(EffectType.glass), blur: 0, x: 0, y: 0 };

    // result
    expect(getNodeChangeMargin(createNode({ effects: [texture] }))).toBeGreaterThanOrEqual(12);
    expect(getNodeChangeMargin(createNode({ effects: [glass] }))).toBeGreaterThanOrEqual(80);
  });

  it('should take the largest effect, not the sum', () => {
    // mock
    const small = { ...createEffect(EffectType.layerBlur), blur: 2, x: 0, y: 0 };
    const large = { ...createEffect(EffectType.layerBlur), blur: 20, x: 0, y: 0 };

    // result
    expect(getNodeChangeMargin(createNode({ effects: [small, large] }))).toBe(getNodeChangeMargin(createNode({ effects: [large] })));
  });

  it('should treat present but unset effects and stroke width as zero', () => {
    // result
    expect(getNodeChangeMargin(createNode({ effects: undefined, strokeWidth: undefined }))).toBe(0);
  });
});
