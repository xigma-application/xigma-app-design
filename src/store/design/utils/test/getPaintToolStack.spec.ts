// types
import { BlendMode } from 'types/design/enums';

// utils
import { getPaintToolStack } from '../getPaintToolStack';

const red = { color: '#ff0000', opacity: 100, type: 'solid' as const };
const image = { opacity: 100, ref: 'r', rotation: 0, scaleMode: 'fill' as const, type: 'image' as const };

describe('getPaintToolStack', () => {
  it('should paint with the plain paint outside the image fill mode', () => {
    // result
    expect(getPaintToolStack(red, null)).toEqual([red]);
    expect(getPaintToolStack(red, undefined)).toEqual([red]);
  });

  it('should paint with the whole image fill, taking a picked blend mode onto every layer', () => {
    // mock
    const fill = [image];

    // result
    expect(getPaintToolStack(red, fill)).toBe(fill);
    expect(getPaintToolStack({ ...red, blendMode: BlendMode.normal }, fill)).toBe(fill);
    expect(getPaintToolStack({ ...red, blendMode: BlendMode.multiply }, fill)).toEqual([{ ...image, blendMode: BlendMode.multiply }]);
  });
});
