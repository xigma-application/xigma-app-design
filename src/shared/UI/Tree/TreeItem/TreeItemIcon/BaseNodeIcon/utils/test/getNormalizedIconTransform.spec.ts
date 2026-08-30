// utils
import { getNormalizedIconTransform } from '../getNormalizedIconTransform';

describe('getNormalizedIconTransform', () => {
  it('returns undefined when the icon has no measurable content yet', () => {
    // result
    expect(getNormalizedIconTransform({ height: 0, width: 10, x: 0, y: 0 }, { height: 20, width: 20, x: 0, y: 0 }, 10)).toBeUndefined();
    expect(getNormalizedIconTransform({ height: 10, width: 0, x: 0, y: 0 }, { height: 20, width: 20, x: 0, y: 0 }, 10)).toBeUndefined();
  });

  it('centers an off-center bbox and scales it up to the max content size, preserving its aspect ratio', () => {
    // result
    expect(getNormalizedIconTransform({ height: 10, width: 10, x: 3, y: 3 }, { height: 20, width: 20, x: 0, y: 0 }, 10)).toEqual({
      transform: 'translate(1px, 1px) scale(2)',
      transformOrigin: '4px 4px',
    });
  });

  it('scales a wide, non-square bbox down uniformly so its widest side matches the max content size', () => {
    // result
    expect(getNormalizedIconTransform({ height: 5, width: 10, x: 5, y: 7.5 }, { height: 20, width: 20, x: 0, y: 0 }, 10)).toEqual({
      transform: 'translate(0px, 0px) scale(2)',
      transformOrigin: '5px 5px',
    });
  });
});
