// utils
import { getGradientBarBackground } from '../getGradientBarBackground';

describe('getGradientBarBackground', () => {
  it('should build a left-to-right linear-gradient css string from the stops', () => {
    // action
    const css = getGradientBarBackground([
      { color: '#ffffff', id: 'a', opacity: 100, position: 0 },
      { color: '#000000', id: 'b', opacity: 100, position: 1 },
    ]);

    // result
    expect(css).toBe('linear-gradient(to right, rgba(255, 255, 255, 1) 0%, rgba(0, 0, 0, 1) 100%)');
  });

  it('should reflect stop opacity in the alpha channel', () => {
    // action
    const css = getGradientBarBackground([{ color: '#ff0000', id: 'a', opacity: 50, position: 0 }]);

    // result
    expect(css).toContain('rgba(255, 0, 0, 0.5)');
  });

  it('should order stops by position regardless of input order', () => {
    // action
    const css = getGradientBarBackground([
      { color: '#000000', id: 'b', opacity: 100, position: 1 },
      { color: '#ffffff', id: 'a', opacity: 100, position: 0 },
    ]);

    // result
    expect(css.indexOf('255, 255, 255')).toBeLessThan(css.indexOf('0, 0, 0'));
  });
});
