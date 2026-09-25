// types
import { StrokeSides } from 'types/design/enums';

// utils
import { getStrokeSidesIcon } from '../getStrokeSidesIcon';

describe('getStrokeSidesIcon', () => {
  it('should return the icon of each side option', () => {
    // result
    expect(getStrokeSidesIcon(StrokeSides.all)).toBe('Stroke');
    expect(getStrokeSidesIcon(StrokeSides.top)).toBe('StrokeTop');
    expect(getStrokeSidesIcon(StrokeSides.custom)).toBe('Properties');
  });
});
