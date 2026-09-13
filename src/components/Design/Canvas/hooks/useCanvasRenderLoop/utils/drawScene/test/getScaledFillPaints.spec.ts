// utils
import { getScaledFillPaints } from '../getScaledFillPaints';

describe('getScaledFillPaints', () => {
  it('should return the same array reference when opacity is 1', () => {
    // mock
    const paints = [{ color: '#fff', opacity: 50, type: 'solid' as const }];

    // action
    const result = getScaledFillPaints(paints, 1);

    // result
    expect(result).toBe(paints);
  });

  it('should scale each paint opacity by the given factor', () => {
    // mock
    const paints = [
      { color: '#fff', opacity: 50, type: 'solid' as const },
      { color: '#000', opacity: 100, type: 'solid' as const },
    ];

    // action
    const result = getScaledFillPaints(paints, 0.5);

    // result
    expect(result).toEqual([
      { color: '#fff', opacity: 25, type: 'solid' },
      { color: '#000', opacity: 50, type: 'solid' },
    ]);
  });
});
