// utils
import { getStrokeStyleOptions } from '../getStrokeStyleOptions';

describe('getStrokeStyleOptions', () => {
  it('should list solid, dashed and a custom option after a separator', () => {
    // before
    const options = getStrokeStyleOptions((style) => style);

    // result
    expect(options.map((option) => option.value)).toEqual(['solid', 'dashed', 'custom']);
    expect(options.map((option) => option.separatorBefore)).toEqual([false, false, true]);
    expect(options[0].icon).toBe('StrokeSolid');
    expect(options[1].icon).toBe('StrokeDashed');
    expect(options[2].icon).toBeUndefined();
  });
});
