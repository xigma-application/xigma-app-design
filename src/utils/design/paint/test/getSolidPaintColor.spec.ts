// utils
import { getSolidPaintColor } from '../getSolidPaintColor';

// types
import { TGradientPaint } from 'types/design/paint/types';

describe('getSolidPaintColor', () => {
  it('should return the color of a single solid paint', () => {
    expect(getSolidPaintColor([{ color: '#123456', opacity: 100, type: 'solid' }])).toBe('#123456');
  });

  it('should return null for an empty paint stack', () => {
    expect(getSolidPaintColor([])).toBeNull();
  });

  it('should return null when the first layer is not a solid paint', () => {
    const gradient: TGradientPaint = { end: { x: 1, y: 1 }, opacity: 100, start: { x: 0, y: 0 }, stops: [], type: 'gradient-linear' };

    expect(getSolidPaintColor([gradient])).toBeNull();
  });
});
