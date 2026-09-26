// utils
import { mapVectorEffectLayers } from '../mapVectorEffectLayers';

describe('mapVectorEffectLayers', () => {
  it('should move every point of every layer and keep the fill rules', () => {
    // mock
    const layers = [{ fillRule: 'nonZero' as const, polygons: [[{ x: 1, y: 2 }]] }];

    // result
    expect(mapVectorEffectLayers(layers, (point) => ({ x: point.x * 2, y: point.y + 1 }))).toEqual([
      { fillRule: 'nonZero', polygons: [[{ x: 2, y: 3 }]] },
    ]);
  });
});
