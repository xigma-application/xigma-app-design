// types
import { TPaint } from 'types/design/paint/types';

// utils
import { getVectorPanelFills } from '../getVectorPanelFills';

const red: TPaint[] = [{ color: '#ff0000', opacity: 100, type: 'solid' }];
const image: TPaint[] = [{ opacity: 100, ref: 'blob:image', rotation: 0, scaleMode: 'fill', type: 'image' }];

describe('getVectorPanelFills', () => {
  it('should return no fills for a vector without filled areas', () => {
    // result
    expect(getVectorPanelFills({ fillByKey: {}, filledFaceKeys: [] })).toEqual([]);
  });

  it('should return the fill every filled area shares', () => {
    // result
    expect(getVectorPanelFills({ fillByKey: { a: image, b: image }, filledFaceKeys: ['a', 'b'] })).toEqual(image);
  });

  it('should return null when the filled areas have different fills', () => {
    // result
    expect(getVectorPanelFills({ fillByKey: { a: image, b: red }, filledFaceKeys: ['a', 'b'] })).toBeNull();
  });
});
