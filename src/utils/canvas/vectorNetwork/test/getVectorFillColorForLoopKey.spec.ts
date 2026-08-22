// utils
import { getVectorFillColorForLoopKey } from '../getVectorFillColorForLoopKey';

describe('getVectorFillColorForLoopKey', () => {
  it('should return a well-formed 6-digit hex color', () => {
    expect(getVectorFillColorForLoopKey('s1[v:a|v:b]')).toMatch(/^#[0-9a-f]{6}$/);
  });

  it('should return the same color for the same loop key every time (deterministic, not random)', () => {
    const key = 's1[v:a|v:b],s2[v:b|v:c]';

    expect(getVectorFillColorForLoopKey(key)).toBe(getVectorFillColorForLoopKey(key));
  });

  it('should return different colors for different loop keys', () => {
    const colorA = getVectorFillColorForLoopKey('s1[v:a|v:b]');
    const colorB = getVectorFillColorForLoopKey('s2[v:c|v:d]');

    expect(colorA).not.toBe(colorB);
  });

  it('should still return a well-formed hex color for an empty loop key', () => {
    expect(getVectorFillColorForLoopKey('')).toMatch(/^#[0-9a-f]{6}$/);
  });
});
