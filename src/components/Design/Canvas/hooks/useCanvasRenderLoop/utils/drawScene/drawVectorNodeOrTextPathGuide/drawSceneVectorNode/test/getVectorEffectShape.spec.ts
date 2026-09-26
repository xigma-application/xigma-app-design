// utils
import { getVectorEffectShape } from '../getVectorEffectShape';

const layers = [
  {
    fillRule: 'evenOdd' as const,
    polygons: [
      [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 5 },
      ],
    ],
  },
  {
    fillRule: 'nonZero' as const,
    polygons: [
      [
        { x: -2, y: 1 },
        { x: 4, y: 8 },
        { x: 3, y: 3 },
      ],
    ],
  },
];

describe('getVectorEffectShape', () => {
  it('should cover every layer with one bounds and keep the layers to fill them one by one', () => {
    // before
    const shape = getVectorEffectShape(layers, 7);

    // result
    expect(shape).toEqual({
      bounds: { height: 8, width: 12, x: -2, y: 0 },
      key: 7,
      layers,
      polygons: [...layers[0].polygons, ...layers[1].polygons],
    });
  });

  it('should give each new shape its own key', () => {
    // result
    expect(getVectorEffectShape(layers).key).not.toBe(getVectorEffectShape(layers).key);
  });
});
