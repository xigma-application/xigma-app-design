// utils
import { getPdfRadialAlphaShadingPattern } from '../getPdfRadialAlphaShadingPattern';

const getPdfGradientAlphaFunctionMock = vi.fn();

vi.mock('../getPdfGradientAlphaFunction', () => ({
  getPdfGradientAlphaFunction: (...args: unknown[]): unknown => getPdfGradientAlphaFunctionMock(...args),
}));

const geometry = {
  direction: { x: 1, y: 0 },
  endPage: { x: 20, y: 0 },
  perpendicular: { x: 0, y: 1 },
  primaryRadius: 20,
  startPage: { x: 5, y: 5 },
};

describe('getPdfRadialAlphaShadingPattern', () => {
  it('should build a gray Type 3 pattern with a unit-circle shading and a Matrix carrying the actual radius/rotation/center', () => {
    // mock
    getPdfGradientAlphaFunctionMock.mockReturnValue('fnRef');

    const context = {} as never;
    const stops = [{ color: '#ff0000', opacity: 50, position: 0 }];

    // action
    const pattern = getPdfRadialAlphaShadingPattern(context, stops, geometry);

    // result
    expect(pattern).toEqual({
      Matrix: [20, 0, 0, 20, 5, 5],
      PatternType: 2,
      Shading: {
        ColorSpace: 'DeviceGray',
        Coords: [0, 0, 0, 0, 0, 1],
        Extend: [true, true],
        Function: 'fnRef',
        ShadingType: 3,
      },
    });
  });

  it('should scale the secondary Matrix axis by the radius ratio for an elliptical radial gradient', () => {
    // mock
    getPdfGradientAlphaFunctionMock.mockReturnValue('fnRef');

    // action
    const pattern = getPdfRadialAlphaShadingPattern({} as never, [], geometry, 0.5);

    // result
    expect((pattern.Matrix as number[])[2]).toBe(0);
    expect((pattern.Matrix as number[])[3]).toBe(10);
  });
});
