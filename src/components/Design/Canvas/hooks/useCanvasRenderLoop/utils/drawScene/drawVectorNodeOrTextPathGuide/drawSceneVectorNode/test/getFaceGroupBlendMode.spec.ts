// types
import { BlendMode } from 'types/design/enums';

// utils
import { getFaceGroupBlendMode } from '../getFaceGroupBlendMode';
import { makeSolidPaint } from 'utils/design/paint/makeSolidPaint';

describe('getFaceGroupBlendMode', () => {
  it('should return undefined when no paint in the stack has a blend mode', () => {
    // result
    expect(getFaceGroupBlendMode([makeSolidPaint('#ff0000')])).toBeUndefined();
  });

  it('should return undefined when the blend mode is Normal', () => {
    // result
    expect(getFaceGroupBlendMode([{ ...makeSolidPaint('#ff0000'), blendMode: BlendMode.normal }])).toBeUndefined();
  });

  it('should return undefined when the blend mode is Pass through', () => {
    // result
    expect(getFaceGroupBlendMode([{ ...makeSolidPaint('#ff0000'), blendMode: BlendMode.passThrough }])).toBeUndefined();
  });

  it('should return the real blend mode set on a paint in the stack', () => {
    // result
    expect(getFaceGroupBlendMode([{ ...makeSolidPaint('#ff0000'), blendMode: BlendMode.multiply }])).toBe(BlendMode.multiply);
  });
});
