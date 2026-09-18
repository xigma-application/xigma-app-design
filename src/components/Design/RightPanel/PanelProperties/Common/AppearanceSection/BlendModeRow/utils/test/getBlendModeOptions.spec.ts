// types
import { BlendMode } from 'types/design/enums';

// utils
import { getBlendModeOptions } from '../getBlendModeOptions';

describe('getBlendModeOptions', () => {
  it('should list every blend mode, in menu order, with its translated label', () => {
    // action
    const options = getBlendModeOptions((blendMode) => `label:${blendMode}`);

    // result
    expect(options[0]).toEqual({ label: `label:${BlendMode.passThrough}`, value: BlendMode.passThrough });
    expect(options.map((option) => option.value)).toContain(BlendMode.darken);
    expect(new Set(options.map((option) => option.value)).size).toBe(options.length);
  });
});
