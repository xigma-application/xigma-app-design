// utils
import { registerSvgGradientDef } from '../registerSvgGradientDef';

describe('registerSvgGradientDef', () => {
  it('should assign an incrementing id based on the current defs length, build the def with it, and push it', () => {
    const defs: string[] = [];

    const firstId = registerSvgGradientDef(defs, (id) => `<def id="${id}"/>`);
    const secondId = registerSvgGradientDef(defs, (id) => `<def id="${id}"/>`);

    expect(firstId).toBe('XigmaGradient0');
    expect(secondId).toBe('XigmaGradient1');
    expect(defs).toEqual(['<def id="XigmaGradient0"/>', '<def id="XigmaGradient1"/>']);
  });
});
