// utils
import { getSvgRadialGradientDef } from '../getSvgRadialGradientDef';

const geometry = {
  direction: { x: 1, y: 0 },
  end: { x: 20, y: 0 },
  perpendicular: { x: 0, y: 1 },
  primaryRadius: 20,
  start: { x: 5, y: 5 },
};

describe('getSvgRadialGradientDef', () => {
  it('should build a radialGradient with a unit circle warped into the shape by gradientTransform', () => {
    // action
    const markup = getSvgRadialGradientDef('grad0', [{ color: '#ff0000', opacity: 100, position: 0 }], geometry);

    // result
    expect(markup).toBe(
      '<radialGradient id="grad0" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="1" gradientTransform="matrix(20 0 0 20 5 5)"><stop offset="0" stop-color="#ff0000" stop-opacity="1"/></radialGradient>',
    );
  });

  it('should scale the secondary matrix axis by the radius ratio for an elliptical radial gradient', () => {
    // action
    const markup = getSvgRadialGradientDef('grad0', [], geometry, 0.5);

    // result
    expect(markup).toContain('matrix(20 0 0 10 5 5)');
  });
});
