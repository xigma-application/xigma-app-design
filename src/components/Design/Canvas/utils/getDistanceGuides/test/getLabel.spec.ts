// utils
import { getLabel } from '../getLabel';

describe('getLabel', () => {
  it('should anchor the label at the midpoint of the two given points', () => {
    // before
    const label = getLabel(0, 0, 100, 50, { x: 0, y: 1 }, 100);

    // result
    expect(label).toEqual({ anchor: { x: 50, y: 25 }, offsetDirection: { x: 0, y: 1 }, text: '100' });
  });

  it('should round the value to the nearest whole unit', () => {
    // before
    const label = getLabel(0, 0, 0, 0, { x: -1, y: 0 }, 50.6);

    // result
    expect(label.text).toBe('51');
  });
});
