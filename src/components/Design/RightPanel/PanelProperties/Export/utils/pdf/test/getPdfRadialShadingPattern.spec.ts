// utils
import { getPdfRadialShadingPattern } from '../getPdfRadialShadingPattern';

const getPdfGradientColorFunctionMock = vi.fn();

vi.mock('../getPdfGradientColorFunction', () => ({
  getPdfGradientColorFunction: (...args: unknown[]): unknown => getPdfGradientColorFunctionMock(...args),
}));

const geometry = {
  direction: { x: 1, y: 0 },
  endPage: { x: 20, y: 0 },
  perpendicular: { x: 0, y: 1 },
  primaryRadius: 20,
  startPage: { x: 5, y: 5 },
};

describe('getPdfRadialShadingPattern', () => {
  it('should build a Type 3 pattern with a unit-circle shading and a Matrix carrying the actual radius/rotation/center', () => {
    // mock
    getPdfGradientColorFunctionMock.mockReturnValue('fnRef');

    const context = {} as never;
    const stops = [{ color: '#ff0000', opacity: 100, position: 0 }];

    // action
    const pattern = getPdfRadialShadingPattern(context, stops, geometry);

    // result
    expect(pattern).toEqual({
      Matrix: [20, 0, 0, 20, 5, 5],
      PatternType: 2,
      Shading: {
        ColorSpace: 'DeviceRGB',
        Coords: [0, 0, 0, 0, 0, 1],
        Extend: [true, true],
        Function: 'fnRef',
        ShadingType: 3,
      },
    });
  });

  it('should scale the secondary Matrix axis by the radius ratio for an elliptical radial gradient', () => {
    // mock
    getPdfGradientColorFunctionMock.mockReturnValue('fnRef');

    // action
    const pattern = getPdfRadialShadingPattern({} as never, [], geometry, 0.5);

    // result
    expect((pattern.Matrix as number[])[2]).toBe(0);
    expect((pattern.Matrix as number[])[3]).toBe(10);
  });
});
