// types
import { BlendMode } from 'types/design/enums';
import { TPaint } from 'types/design/paint/types';

// utils
import { isPlainSolidPaint } from '../isPlainSolidPaint';

const solid: TPaint = { color: '#ff0000', opacity: 100, type: 'solid' };
const image: TPaint = { opacity: 100, ref: 'img', rotation: 0, scaleMode: 'fill', type: 'image' };

describe('isPlainSolidPaint', () => {
  it('should allow a plain solid paint', () => {
    expect(isPlainSolidPaint(solid)).toBe(true);
  });

  it('should allow a solid paint with a normal blend mode', () => {
    expect(isPlainSolidPaint({ ...solid, blendMode: BlendMode.normal })).toBe(true);
  });

  it('should allow any hidden paint regardless of type', () => {
    expect(isPlainSolidPaint({ ...image, visible: false })).toBe(true);
  });

  it('should reject a visible non-solid paint', () => {
    expect(isPlainSolidPaint(image)).toBe(false);
  });

  it('should reject a solid paint with a non-normal blend mode', () => {
    expect(isPlainSolidPaint({ ...solid, blendMode: BlendMode.multiply })).toBe(false);
  });
});
