// utils
import { getSvgLinearGradientDef } from '../getSvgLinearGradientDef';

const geometry = {
  direction: { x: 1, y: 0 },
  end: { x: 20, y: 0 },
  perpendicular: { x: 0, y: 1 },
  primaryRadius: 20,
  start: { x: 0, y: 0 },
};

describe('getSvgLinearGradientDef', () => {
  it('should build a linearGradient element with userSpaceOnUse coordinates and the given stops', () => {
    // action
    const markup = getSvgLinearGradientDef('grad0', [{ color: '#ff0000', opacity: 100, position: 0 }], geometry);

    // result
    expect(markup).toBe(
      '<linearGradient id="grad0" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="20" y2="0"><stop offset="0" stop-color="#ff0000" stop-opacity="1"/></linearGradient>',
    );
  });
});
