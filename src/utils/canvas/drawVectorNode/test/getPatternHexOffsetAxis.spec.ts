// types
import { TPatternPaint } from 'types/design/paint/types';

// utils
import { getPatternHexOffsetAxis } from '../getPatternHexOffsetAxis';

const buildPaint = (overrides: Partial<TPatternPaint> = {}): TPatternPaint => ({
  alignmentIndex: 0,
  direction: 'horizontal',
  offsetX: 0,
  offsetY: 0,
  opacity: 100,
  scale: 100,
  spacingX: 0,
  spacingY: 0,
  tileType: 'rectangular',
  type: 'pattern',
  ...overrides,
});

describe('getPatternHexOffsetAxis', () => {
  it('should return 0 for a rectangular tile type, regardless of direction', () => {
    // before
    const result = getPatternHexOffsetAxis(buildPaint({ direction: 'vertical', tileType: 'rectangular' }));

    // result
    expect(result).toBe(0);
  });

  it('should return 1 (offset rows in X) for a hexagonal tile type with horizontal direction', () => {
    // before
    const result = getPatternHexOffsetAxis(buildPaint({ direction: 'horizontal', tileType: 'hexagonal' }));

    // result
    expect(result).toBe(1);
  });

  it('should return 2 (offset columns in Y) for a hexagonal tile type with vertical direction', () => {
    // before
    const result = getPatternHexOffsetAxis(buildPaint({ direction: 'vertical', tileType: 'hexagonal' }));

    // result
    expect(result).toBe(2);
  });
});
