// utils
import { getSvgImagePatternDef } from '../getSvgImagePatternDef';

describe('getSvgImagePatternDef', () => {
  it('should build a userSpaceOnUse pattern containing one image sized to the tile, with no patternTransform when the value is empty', () => {
    const def = getSvgImagePatternDef('XigmaPattern0', 'data:image/png;base64,AAAA', 40, 20, '');

    expect(def).toBe(
      '<pattern id="XigmaPattern0" patternUnits="userSpaceOnUse" width="40" height="20"><image href="data:image/png;base64,AAAA" width="40" height="20"/></pattern>',
    );
  });

  it('should add a patternTransform attribute when a rotation value is given', () => {
    const def = getSvgImagePatternDef('XigmaPattern1', 'data:image/png;base64,AAAA', 40, 20, 'rotate(45 10 10)');

    expect(def).toContain('patternTransform="rotate(45 10 10)"');
  });
});
