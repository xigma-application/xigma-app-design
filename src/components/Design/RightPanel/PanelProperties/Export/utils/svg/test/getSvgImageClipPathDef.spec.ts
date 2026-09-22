// utils
import { getSvgImageClipPathDef } from '../getSvgImageClipPathDef';

describe('getSvgImageClipPathDef', () => {
  it('should wrap the polygon path data in a clipPath element with the given id', () => {
    const bounds = { height: 100, width: 100, x: 0, y: 0 };
    const polygons = [
      [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
      ],
    ];

    const def = getSvgImageClipPathDef('XigmaClip0', polygons, bounds);

    expect(def).toBe('<clipPath id="XigmaClip0"><path d="M0 0 L10 0 L10 10 Z"/></clipPath>');
  });
});
