// types
import { TPaint } from 'types/design/paint/types';

// utils
import { getEffectiveFillColor } from '../getEffectiveFillColor';

describe('getEffectiveFillColor', () => {
  it("should return the top visible fill's color when it is a fully opaque solid", () => {
    const fills: TPaint[] = [{ color: '#ff0000', opacity: 100, type: 'solid' }];

    expect(getEffectiveFillColor(fills)).toBe('#ff0000');
  });

  it('should skip a hidden top fill and resolve the next visible one', () => {
    const fills: TPaint[] = [
      { color: '#00ff00', opacity: 100, type: 'solid', visible: false },
      { color: '#0000ff', opacity: 100, type: 'solid' },
    ];

    expect(getEffectiveFillColor(fills)).toBe('#0000ff');
  });

  it('should return null when the top visible fill is semi-transparent', () => {
    const fills: TPaint[] = [{ color: '#ff0000', opacity: 50, type: 'solid' }];

    expect(getEffectiveFillColor(fills)).toBeNull();
  });

  it('should return null when the top visible fill is not solid', () => {
    const fills: TPaint[] = [{ opacity: 100, ref: 'asset-1', rotation: 0, scaleMode: 'fill', type: 'image' }];

    expect(getEffectiveFillColor(fills)).toBeNull();
  });

  it('should return null for an empty fills array', () => {
    expect(getEffectiveFillColor([])).toBeNull();
  });

  it('should return null when every fill is hidden', () => {
    const fills: TPaint[] = [{ color: '#ff0000', opacity: 100, type: 'solid', visible: false }];

    expect(getEffectiveFillColor(fills)).toBeNull();
  });
});
