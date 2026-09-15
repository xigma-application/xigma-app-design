// types
import { TDraftRect } from 'types/canvas';
import { TPatternPaint } from 'types/design/paint/types';

// utils
import { getPatternTileGridFractions } from '../getPatternTileGridFractions';

const buildBounds = (overrides: Partial<TDraftRect> = {}): TDraftRect => ({ height: 40, width: 40, x: 0, y: 0, ...overrides });
const buildPaint = (overrides: Partial<TPatternPaint> = {}): TPatternPaint => ({
  alignmentIndex: 0,
  direction: 'horizontal',
  opacity: 100,
  scale: 100,
  spacingX: 0,
  spacingY: 0,
  tileType: 'rectangular',
  type: 'pattern',
  ...overrides,
});

describe('getPatternTileGridFractions', () => {
  it('should produce a tile fraction matching the tile-to-bounds ratio with no spacing', () => {
    // before
    const result = getPatternTileGridFractions(buildBounds(), 10, 10, buildPaint());

    // result
    expect(result.tileFrac).toEqual({ x: 0.25, y: 0.25 });
  });

  it('should make the period fraction equal the tile fraction when spacing is zero', () => {
    // before
    const result = getPatternTileGridFractions(buildBounds(), 10, 10, buildPaint());

    // result
    expect(result.periodFrac).toEqual({ x: 0.25, y: 0.25 });
  });

  it('should widen the period fraction by the spacing percentage of the tile size', () => {
    // before — 100% spacing doubles the 10x10 tile's period to 20x20
    const result = getPatternTileGridFractions(buildBounds(), 10, 10, buildPaint({ spacingX: 100, spacingY: 100 }));

    // result
    expect(result.periodFrac).toEqual({ x: 0.5, y: 0.5 });
  });

  it('should widen each axis independently when spacingX and spacingY differ', () => {
    // before
    const result = getPatternTileGridFractions(buildBounds(), 10, 10, buildPaint({ spacingX: 100 }));

    // result
    expect(result.periodFrac).toEqual({ x: 0.5, y: 0.25 });
  });

  it('should leave the grid flush with the top-left when alignmentIndex is 0', () => {
    // before
    const result = getPatternTileGridFractions(buildBounds(), 10, 10, buildPaint());

    // result
    expect(result.alignFrac).toEqual({ x: 0, y: 0 });
  });

  it('should center a tile on the shape when alignmentIndex picks the center point', () => {
    // before — alignmentIndex 4 is the 3x3 grid's center point (row 1, col 1)
    const result = getPatternTileGridFractions(buildBounds(), 10, 10, buildPaint({ alignmentIndex: 4 }));

    // result — offset = boundsSize / 2 - tileSize / 2 = 20 - 5 = 15, as a fraction of 40
    expect(result.alignFrac).toEqual({ x: 0.375, y: 0.375 });
  });

  it('should flush the grid against the bottom-right when alignmentIndex picks the bottom-right point', () => {
    // before — alignmentIndex 8 is the 3x3 grid's bottom-right point (row 2, col 2)
    const result = getPatternTileGridFractions(buildBounds(), 10, 10, buildPaint({ alignmentIndex: 8 }));

    // result — offset = boundsSize - tileSize = 30, as a fraction of 40
    expect(result.alignFrac).toEqual({ x: 0.75, y: 0.75 });
  });

  it('should resolve row and column independently for an off-diagonal alignment point', () => {
    // before — alignmentIndex 5 is row 1 (middle), col 2 (right)
    const result = getPatternTileGridFractions(buildBounds(), 10, 10, buildPaint({ alignmentIndex: 5 }));

    // result — x flush right (30/40), y centered (15/40)
    expect(result.alignFrac).toEqual({ x: 0.75, y: 0.375 });
  });

  it('should fall back to a safe divisor when bounds are zero-sized, avoiding division by zero', () => {
    // before
    const result = getPatternTileGridFractions(buildBounds({ height: 0, width: 0 }), 10, 10, buildPaint());

    // result
    expect(result.tileFrac).toEqual({ x: 10, y: 10 });
  });
});
