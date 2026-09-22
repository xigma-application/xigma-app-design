// types
import { BlendMode } from 'types/design/enums';
import { TPaint } from 'types/design/paint/types';

// utils
import { isPlainPaint } from '../isPlainPaint';

const solid: TPaint = { color: '#ff0000', opacity: 100, type: 'solid' };
const image: TPaint = { opacity: 100, ref: 'img', rotation: 0, scaleMode: 'fill', type: 'image' };
const linearGradient: TPaint = {
  end: { x: 10, y: 10 },
  opacity: 100,
  start: { x: 0, y: 0 },
  stops: [],
  type: 'gradient-linear',
};

describe('isPlainPaint', () => {
  it('should allow a plain solid paint', () => {
    expect(isPlainPaint(solid)).toBe(true);
  });

  it('should allow a solid paint with a normal blend mode', () => {
    expect(isPlainPaint({ ...solid, blendMode: BlendMode.normal })).toBe(true);
  });

  it('should allow any hidden paint regardless of type', () => {
    expect(isPlainPaint({ ...image, visible: false })).toBe(true);
  });

  it('should reject a visible non-solid, non-gradient paint', () => {
    expect(isPlainPaint(image)).toBe(false);
  });

  it('should reject a solid paint with a non-normal blend mode', () => {
    expect(isPlainPaint({ ...solid, blendMode: BlendMode.multiply })).toBe(false);
  });

  it('should allow any gradient type with a normal blend mode', () => {
    expect(isPlainPaint(linearGradient)).toBe(true);
    expect(isPlainPaint({ ...linearGradient, type: 'gradient-radial' })).toBe(true);
    expect(isPlainPaint({ ...linearGradient, type: 'gradient-angular' })).toBe(true);
    expect(isPlainPaint({ ...linearGradient, type: 'gradient-diamond' })).toBe(true);
    expect(isPlainPaint({ ...linearGradient, blendMode: BlendMode.multiply })).toBe(false);
  });
});
