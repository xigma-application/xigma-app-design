// types
import { BlendMode } from 'types/design/enums';
import { TPaint } from 'types/design/paint/types';

// utils
import { isSolidPaint } from '../isSolidPaint';

const solid: TPaint = { color: '#ff0000', opacity: 100, type: 'solid' };
const linearGradient: TPaint = {
  end: { x: 10, y: 10 },
  opacity: 100,
  start: { x: 0, y: 0 },
  stops: [],
  type: 'gradient-linear',
};

describe('isSolidPaint', () => {
  it('should allow a plain solid paint', () => {
    expect(isSolidPaint(solid)).toBe(true);
  });

  it('should allow a solid paint with a normal blend mode', () => {
    expect(isSolidPaint({ ...solid, blendMode: BlendMode.normal })).toBe(true);
  });

  it('should allow any hidden paint regardless of type', () => {
    expect(isSolidPaint({ ...linearGradient, visible: false })).toBe(true);
  });

  it('should reject a visible gradient paint', () => {
    expect(isSolidPaint(linearGradient)).toBe(false);
  });

  it('should reject a solid paint with a non-normal blend mode', () => {
    expect(isSolidPaint({ ...solid, blendMode: BlendMode.multiply })).toBe(false);
  });
});
