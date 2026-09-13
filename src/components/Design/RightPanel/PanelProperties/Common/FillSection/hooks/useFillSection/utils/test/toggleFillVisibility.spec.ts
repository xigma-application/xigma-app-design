// utils
import { toggleFillVisibility } from '../toggleFillVisibility';

const paint = (visible?: false): { color: string; opacity: number; type: 'solid'; visible?: false } => ({
  color: '#000000',
  opacity: 100,
  type: 'solid',
  visible,
});

describe('toggleFillVisibility', () => {
  it('should hide a visible fill at the given index', () => {
    // before
    const result = toggleFillVisibility([paint(), paint()], 0);

    // result
    expect(result[0].visible).toBe(false);
    expect(result[1].visible).toBeUndefined();
  });

  it('should show a hidden fill at the given index', () => {
    // before
    const result = toggleFillVisibility([paint(false)], 0);

    // result
    expect(result[0].visible).toBeUndefined();
  });

  it('should leave other fills untouched', () => {
    // before
    const fills = [paint(), paint(false)];
    const result = toggleFillVisibility(fills, 1);

    // result
    expect(result[0]).toBe(fills[0]);
  });
});
