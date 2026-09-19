// utils
import { getStrokeBrushOptions } from '../getStrokeBrushOptions';

describe('getStrokeBrushOptions', () => {
  it('should list every brush of both categories with a translated label', () => {
    // before
    const options = getStrokeBrushOptions((key) => key);

    // result
    expect(options).toHaveLength(25);
    expect(options[0]).toMatchObject({ label: 'shared.brushes.names.heist', value: 'heist' });
    expect(options[24].value).toBe('oi');
  });
});
