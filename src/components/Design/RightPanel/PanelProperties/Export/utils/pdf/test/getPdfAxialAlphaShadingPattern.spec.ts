// utils
import { getPdfAxialAlphaShadingPattern } from '../getPdfAxialAlphaShadingPattern';

const getPdfGradientAlphaFunctionMock = vi.fn();

vi.mock('../getPdfGradientAlphaFunction', () => ({
  getPdfGradientAlphaFunction: (...args: unknown[]): unknown => getPdfGradientAlphaFunctionMock(...args),
}));

const geometry = {
  direction: { x: 1, y: 0 },
  endPage: { x: 20, y: 0 },
  perpendicular: { x: 0, y: 1 },
  primaryRadius: 20,
  startPage: { x: 0, y: 0 },
};

describe('getPdfAxialAlphaShadingPattern', () => {
  it('should build a gray Type 2 pattern using the page-space start/end as Coords', () => {
    // mock
    getPdfGradientAlphaFunctionMock.mockReturnValue('fnRef');

    const context = {} as never;
    const stops = [{ color: '#ff0000', opacity: 50, position: 0 }];

    // action
    const pattern = getPdfAxialAlphaShadingPattern(context, stops, geometry);

    // result
    expect(pattern).toEqual({
      PatternType: 2,
      Shading: {
        ColorSpace: 'DeviceGray',
        Coords: [0, 0, 20, 0],
        Extend: [true, true],
        Function: 'fnRef',
        ShadingType: 2,
      },
    });
    expect(getPdfGradientAlphaFunctionMock).toHaveBeenCalledWith(context, stops);
  });
});
