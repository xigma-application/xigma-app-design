// utils
import { getVectorPaintToolFill } from '../getVectorPaintToolFill';
import { makeSquareVector } from 'utils/canvas/vector/stroke/test/fixtures';

const image = [{ opacity: 100, ref: 'r', rotation: 0, scaleMode: 'fill' as const, type: 'image' as const }];
const red = [{ color: '#ff0000', opacity: 100, type: 'solid' as const }];

describe('getVectorPaintToolFill', () => {
  it('should paint with the image fill every area of the vectors shares', () => {
    // mock
    const first = makeSquareVector({ fillByKey: { a: image, b: image }, filledFaceKeys: ['a', 'b'] });
    const second = makeSquareVector({ fillByKey: { c: image }, filledFaceKeys: ['c'] });

    // result
    expect(getVectorPaintToolFill([first, second])).toEqual(image);
  });

  it('should keep the normal paint for mixed areas, different vectors, a color fill or no fill', () => {
    // mock
    const withImage = makeSquareVector({ fillByKey: { a: image }, filledFaceKeys: ['a'] });

    // result
    expect(getVectorPaintToolFill([makeSquareVector({ fillByKey: { a: image, b: red }, filledFaceKeys: ['a', 'b'] })])).toBeNull();
    expect(getVectorPaintToolFill([withImage, makeSquareVector({ fillByKey: { a: red }, filledFaceKeys: ['a'] })])).toBeNull();
    expect(getVectorPaintToolFill([makeSquareVector({ fillByKey: { a: red }, filledFaceKeys: ['a'] })])).toBeNull();
    expect(getVectorPaintToolFill([makeSquareVector()])).toBeNull();
    expect(getVectorPaintToolFill([])).toBeNull();
  });
});
