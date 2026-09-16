// utils
import { getImageFillPlaceholderVertices } from '../getImageFillPlaceholderVertices';

describe('getImageFillPlaceholderVertices', () => {
  it('should split an exact grid evenly between the two alternating colors', () => {
    // before — 20x10 bounds at a 10px square size is an exact 2x1 grid
    const { squaresA, squaresB } = getImageFillPlaceholderVertices({ height: 10, width: 20, x: 0, y: 0 });

    // result — 2 squares total (6 vertices * 2 floats each = 12 numbers per square), one per color
    expect(squaresA).toHaveLength(12);
    expect(squaresB).toHaveLength(12);
  });

  it('should place the first square at the bounds origin', () => {
    // before
    const { squaresA } = getImageFillPlaceholderVertices({ height: 10, width: 10, x: 5, y: 5 });

    // result — a single square: two triangles covering (5,5)-(15,15)
    expect(squaresA.slice(0, 2)).toEqual([5, 5]);
    expect(squaresA.slice(2, 4)).toEqual([15, 5]);
    expect(squaresA.slice(4, 6)).toEqual([15, 15]);
  });

  it('should clip the last column of squares to the bounds edge instead of overshooting it', () => {
    // before — 25px wide bounds at a 10px square size needs 3 columns: 0-10, 10-20, and a clipped 20-25
    const { squaresA } = getImageFillPlaceholderVertices({ height: 10, width: 25, x: 0, y: 0 });
    const xValues = squaresA.filter((_, index) => index % 2 === 0);

    // result — the third column (same color as the first, since 0 and 2 are both even) clips to x=25
    expect(Math.max(...xValues)).toBe(25);
  });

  it('should alternate colors in a checkerboard pattern, not stripes', () => {
    // before — a 3x2 grid: (0,0)=A (1,0)=B (2,0)=A / (0,1)=B (1,1)=A (2,1)=B
    const { squaresA, squaresB } = getImageFillPlaceholderVertices({ height: 20, width: 30, x: 0, y: 0 });

    // result — 6 squares total, split 3/3 since a 3x2 checkerboard is balanced
    expect(squaresA).toHaveLength(3 * 12);
    expect(squaresB).toHaveLength(3 * 12);
  });

  it('should produce no squares for zero-area bounds', () => {
    // before
    const { squaresA, squaresB } = getImageFillPlaceholderVertices({ height: 0, width: 0, x: 0, y: 0 });

    // result
    expect(squaresA).toEqual([]);
    expect(squaresB).toEqual([]);
  });
});
