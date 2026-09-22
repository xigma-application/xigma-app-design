// utils
import { getPdfAxialShadingPattern } from '../getPdfAxialShadingPattern';

const getPdfGradientColorFunctionMock = vi.fn();

vi.mock('../getPdfGradientColorFunction', () => ({
  getPdfGradientColorFunction: (...args: unknown[]): unknown => getPdfGradientColorFunctionMock(...args),
}));

const geometry = {
  direction: { x: 1, y: 0 },
  endPage: { x: 20, y: 0 },
  perpendicular: { x: 0, y: 1 },
  primaryRadius: 20,
  startPage: { x: 0, y: 0 },
};

describe('getPdfAxialShadingPattern', () => {
  it('should build a Type 2 pattern using the page-space start/end as Coords', () => {
    // mock
    getPdfGradientColorFunctionMock.mockReturnValue('fnRef');

    const context = {} as never;
    const stops = [{ color: '#ff0000', opacity: 100, position: 0 }];

    // action
    const pattern = getPdfAxialShadingPattern(context, stops, geometry);

    // result
    expect(pattern).toEqual({
      PatternType: 2,
      Shading: {
        ColorSpace: 'DeviceRGB',
        Coords: [0, 0, 20, 0],
        Extend: [true, true],
        Function: 'fnRef',
        ShadingType: 2,
      },
    });
    expect(getPdfGradientColorFunctionMock).toHaveBeenCalledWith(context, stops);
  });
});
