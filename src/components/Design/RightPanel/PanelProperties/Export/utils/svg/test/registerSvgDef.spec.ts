// utils
import { registerSvgDef } from '../registerSvgDef';

describe('registerSvgDef', () => {
  it('should build an id from the prefix and the current defs length, then push the built def', () => {
    const defs: string[] = ['<existing/>'];

    const id = registerSvgDef(defs, 'XigmaClip', (defId) => `<clipPath id="${defId}"/>`);

    expect(id).toBe('XigmaClip1');
    expect(defs).toEqual(['<existing/>', '<clipPath id="XigmaClip1"/>']);
  });

  it('should start at index 0 for an empty defs array', () => {
    const defs: string[] = [];

    expect(registerSvgDef(defs, 'XigmaPattern', (defId) => defId)).toBe('XigmaPattern0');
  });
});
