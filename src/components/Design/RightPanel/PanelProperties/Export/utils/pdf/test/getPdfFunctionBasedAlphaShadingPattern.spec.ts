// utils
import { getPdfFunctionBasedAlphaShadingPattern } from '../getPdfFunctionBasedAlphaShadingPattern';

const getPdfGradientGeometryProgramMock = vi.fn();
const getPdfGradientAlphaLookupProgramMock = vi.fn();

vi.mock('../getPdfGradientGeometryProgram', () => ({
  getPdfGradientGeometryProgram: (...args: unknown[]): unknown => getPdfGradientGeometryProgramMock(...args),
}));
vi.mock('../getPdfGradientAlphaLookupProgram', () => ({
  getPdfGradientAlphaLookupProgram: (...args: unknown[]): unknown => getPdfGradientAlphaLookupProgramMock(...args),
}));

const geometry = {
  direction: { x: 1, y: 0 },
  endPage: { x: 10, y: 0 },
  perpendicular: { x: 0, y: 1 },
  primaryRadius: 10,
  startPage: { x: 0, y: 0 },
};
const bounds = { height: 200, width: 400, x: 0, y: 0 };

describe('getPdfFunctionBasedAlphaShadingPattern', () => {
  it('should register a Type 4 PostScript stream wrapping the geometry and alpha programs, and build a gray Type 1 shading pattern', () => {
    // mock
    getPdfGradientGeometryProgramMock.mockReturnValue('GEOMETRY');
    getPdfGradientAlphaLookupProgramMock.mockReturnValue('ALPHA');

    const stream = vi.fn((contents: unknown, dict: unknown) => ({ contents, dict }));
    const register = vi.fn((value: unknown) => value);
    const context = { register, stream } as never;
    const stops = [{ color: '#ff0000', opacity: 50, position: 0 }];

    // action
    const pattern = getPdfFunctionBasedAlphaShadingPattern(context, 'gradient-angular', stops, geometry, 1, bounds);

    // result
    expect(getPdfGradientGeometryProgramMock).toHaveBeenCalledWith('gradient-angular', geometry, 1);
    expect(getPdfGradientAlphaLookupProgramMock).toHaveBeenCalledWith(stops);
    expect(stream).toHaveBeenCalledWith('{ GEOMETRY ALPHA }', { Domain: [0, 400, 0, 200], FunctionType: 4, Range: [0, 1] });
    expect(pattern).toEqual({
      PatternType: 2,
      Shading: {
        ColorSpace: 'DeviceGray',
        Domain: [0, 400, 0, 200],
        Function: { contents: '{ GEOMETRY ALPHA }', dict: { Domain: [0, 400, 0, 200], FunctionType: 4, Range: [0, 1] } },
        ShadingType: 1,
      },
    });
  });
});
