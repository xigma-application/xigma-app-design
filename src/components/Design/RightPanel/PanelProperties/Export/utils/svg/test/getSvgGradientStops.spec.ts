// utils
import { getSvgGradientStops } from '../getSvgGradientStops';

describe('getSvgGradientStops', () => {
  it('should build one stop element per gradient stop with its offset, color and opacity', () => {
    // action
    const markup = getSvgGradientStops([
      { color: '#ff0000', opacity: 100, position: 0 },
      { color: '#0000ff', opacity: 50, position: 1 },
    ]);

    // result
    expect(markup).toBe(
      '<stop offset="0" stop-color="#ff0000" stop-opacity="1"/><stop offset="1" stop-color="#0000ff" stop-opacity="0.5"/>',
    );
  });

  it('should build nothing for an empty stops list', () => {
    expect(getSvgGradientStops([])).toBe('');
  });
});
