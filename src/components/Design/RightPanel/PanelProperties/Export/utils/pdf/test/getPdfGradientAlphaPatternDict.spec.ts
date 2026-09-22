// types
import { TGradientPaint } from 'types/design/paint/types';

// utils
import { getPdfGradientAlphaPatternDict } from '../getPdfGradientAlphaPatternDict';

const getPdfAxialAlphaShadingPatternMock = vi.fn();
const getPdfRadialAlphaShadingPatternMock = vi.fn();
const getPdfFunctionBasedAlphaShadingPatternMock = vi.fn();

vi.mock('../getPdfAxialAlphaShadingPattern', () => ({
  getPdfAxialAlphaShadingPattern: (...args: unknown[]): unknown => getPdfAxialAlphaShadingPatternMock(...args),
}));
vi.mock('../getPdfRadialAlphaShadingPattern', () => ({
  getPdfRadialAlphaShadingPattern: (...args: unknown[]): unknown => getPdfRadialAlphaShadingPatternMock(...args),
}));
vi.mock('../getPdfFunctionBasedAlphaShadingPattern', () => ({
  getPdfFunctionBasedAlphaShadingPattern: (...args: unknown[]): unknown => getPdfFunctionBasedAlphaShadingPatternMock(...args),
}));

const context = {} as never;
const geometry = {
  direction: { x: 1, y: 0 },
  endPage: { x: 10, y: 0 },
  perpendicular: { x: 0, y: 1 },
  primaryRadius: 10,
  startPage: { x: 0, y: 0 },
};
const bounds = { height: 100, width: 100, x: 0, y: 0 };

const paint: TGradientPaint = {
  end: { x: 10, y: 0 },
  opacity: 100,
  start: { x: 0, y: 0 },
  stops: [
    { color: '#ff0000', opacity: 100, position: 0 },
    { color: '#0000ff', opacity: 50, position: 1 },
  ],
  type: 'gradient-linear',
};

describe('getPdfGradientAlphaPatternDict', () => {
  beforeEach(() => {
    getPdfAxialAlphaShadingPatternMock.mockReset();
    getPdfRadialAlphaShadingPatternMock.mockReset();
    getPdfFunctionBasedAlphaShadingPatternMock.mockReset();
  });

  it('should build an axial alpha pattern for a linear gradient', () => {
    // action
    getPdfGradientAlphaPatternDict(context, paint, geometry, bounds);

    // result
    expect(getPdfAxialAlphaShadingPatternMock).toHaveBeenCalledWith(context, paint.stops, geometry);
    expect(getPdfRadialAlphaShadingPatternMock).not.toHaveBeenCalled();
    expect(getPdfFunctionBasedAlphaShadingPatternMock).not.toHaveBeenCalled();
  });

  it('should build a radial alpha pattern for a radial gradient', () => {
    // action
    getPdfGradientAlphaPatternDict(context, { ...paint, radiusRatio: 0.5, type: 'gradient-radial' }, geometry, bounds);

    // result
    expect(getPdfRadialAlphaShadingPatternMock).toHaveBeenCalledWith(context, paint.stops, geometry, 0.5);
    expect(getPdfAxialAlphaShadingPatternMock).not.toHaveBeenCalled();
  });

  it('should build a function-based alpha pattern for an angular or diamond gradient', () => {
    // action
    getPdfGradientAlphaPatternDict(context, { ...paint, radiusRatio: 0.5, type: 'gradient-angular' }, geometry, bounds);

    // result
    expect(getPdfFunctionBasedAlphaShadingPatternMock).toHaveBeenCalledWith(
      context,
      'gradient-angular',
      paint.stops,
      geometry,
      0.5,
      bounds,
    );
  });

  it('should default the radius ratio to 1 for an angular/diamond gradient when it is not set', () => {
    // action
    getPdfGradientAlphaPatternDict(context, { ...paint, type: 'gradient-diamond' }, geometry, bounds);

    // result
    expect(getPdfFunctionBasedAlphaShadingPatternMock).toHaveBeenCalledWith(context, 'gradient-diamond', paint.stops, geometry, 1, bounds);
  });
});
