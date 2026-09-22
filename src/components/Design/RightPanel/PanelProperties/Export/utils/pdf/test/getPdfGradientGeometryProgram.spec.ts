// utils
import { getPdfGradientGeometryProgram } from '../getPdfGradientGeometryProgram';

const geometry = {
  direction: { x: 1, y: 0 },
  endPage: { x: 10, y: 0 },
  perpendicular: { x: 0, y: 1 },
  primaryRadius: 10,
  startPage: { x: 0, y: 0 },
};

describe('getPdfGradientGeometryProgram', () => {
  it('should build an atan-based program for an angular gradient without scaling a by the primary radius', () => {
    // action
    const program = getPdfGradientGeometryProgram('gradient-angular', geometry, 1);

    // result
    expect(program).toBe(
      '2 copy 1 mul exch 0 mul add 0 add 3 1 roll 0 mul exch 1 mul add 0 add atan 360 div dup 0 lt { pop 0 } if dup 1 gt { pop 1 } if',
    );
  });

  it('should build an abs-based program for a diamond gradient, scaling both a and b by the primary radius', () => {
    // action
    const program = getPdfGradientGeometryProgram('gradient-diamond', geometry, 1);

    // result — a is scaled by 1/primaryRadius = 0.1, b likewise
    expect(program).toBe(
      '2 copy 0.1 mul exch 0 mul add 0 add 3 1 roll 0 mul exch 0.1 mul add 0 add abs exch abs add dup 0 lt { pop 0 } if dup 1 gt { pop 1 } if',
    );
  });

  it('should divide the secondary axis by the radius ratio', () => {
    // action
    const program = getPdfGradientGeometryProgram('gradient-angular', geometry, 0.5);

    // result — bCoefY = perpendicular.y / radiusRatio = 1 / 0.5 = 2
    expect(program).toContain('2 copy 2 mul');
  });

  it('should fall back to a radius ratio of 1 when it is falsy', () => {
    // action
    const program = getPdfGradientGeometryProgram('gradient-angular', geometry, 0);

    // result
    expect(program).toContain('2 copy 1 mul');
  });

  it('should not divide by zero when the primary radius is zero for a diamond gradient', () => {
    // action
    const program = getPdfGradientGeometryProgram('gradient-diamond', { ...geometry, primaryRadius: 0 }, 1);

    // result — falls back to scale 1 instead of dividing by zero
    expect(program).toContain('2 copy 1 mul');
  });
});
