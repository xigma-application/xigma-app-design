// types
import { BlendMode } from 'types/design/enums';
import { TPaint } from 'types/design/paint/types';

// utils
import { isSvgVectorPaint } from '../isSvgVectorPaint';

const solid: TPaint = { color: '#ff0000', opacity: 100, type: 'solid' };
const image: TPaint = { opacity: 100, ref: 'img', rotation: 0, scaleMode: 'fill', type: 'image' };
const linearGradient: TPaint = {
  end: { x: 10, y: 10 },
  opacity: 100,
  start: { x: 0, y: 0 },
  stops: [],
  type: 'gradient-linear',
};

describe('isSvgVectorPaint', () => {
  it('should allow a plain solid paint', () => {
    expect(isSvgVectorPaint(solid)).toBe(true);
  });

  it('should allow a solid paint with a normal blend mode', () => {
    expect(isSvgVectorPaint({ ...solid, blendMode: BlendMode.normal })).toBe(true);
  });

  it('should allow any hidden paint regardless of type', () => {
    expect(isSvgVectorPaint({ ...image, visible: false })).toBe(true);
  });

  it('should reject a visible non-solid, non-gradient paint', () => {
    expect(isSvgVectorPaint(image)).toBe(false);
  });

  it('should reject a solid paint with a non-normal blend mode', () => {
    expect(isSvgVectorPaint({ ...solid, blendMode: BlendMode.multiply })).toBe(false);
  });

  it('should allow linear and radial gradients with a normal blend mode', () => {
    expect(isSvgVectorPaint(linearGradient)).toBe(true);
    expect(isSvgVectorPaint({ ...linearGradient, type: 'gradient-radial' })).toBe(true);
    expect(isSvgVectorPaint({ ...linearGradient, blendMode: BlendMode.multiply })).toBe(false);
  });

  it('should reject angular and diamond gradients (not yet supported natively in SVG)', () => {
    expect(isSvgVectorPaint({ ...linearGradient, type: 'gradient-angular' })).toBe(false);
    expect(isSvgVectorPaint({ ...linearGradient, type: 'gradient-diamond' })).toBe(false);
  });
});
