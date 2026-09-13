// utils
import { getFillsInPaintOrder } from '../getFillsInPaintOrder';

describe('getFillsInPaintOrder', () => {
  it('should reverse the fill list, since the first fill in the list is the topmost and must paint last', () => {
    const fills = [
      { color: '#111111', opacity: 100, type: 'solid' as const },
      { color: '#222222', opacity: 100, type: 'solid' as const },
      { color: '#333333', opacity: 100, type: 'solid' as const },
    ];

    expect(getFillsInPaintOrder(fills)).toEqual([
      { color: '#333333', opacity: 100, type: 'solid' },
      { color: '#222222', opacity: 100, type: 'solid' },
      { color: '#111111', opacity: 100, type: 'solid' },
    ]);
  });

  it('should not mutate the original array', () => {
    const fills = [
      { color: '#111111', opacity: 100, type: 'solid' as const },
      { color: '#222222', opacity: 100, type: 'solid' as const },
    ];

    getFillsInPaintOrder(fills);

    expect(fills[0].color).toBe('#111111');
  });
});
