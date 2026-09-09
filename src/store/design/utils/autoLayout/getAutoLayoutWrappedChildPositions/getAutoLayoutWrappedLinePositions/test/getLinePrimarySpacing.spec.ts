// types
import { AutoSpacing, LayoutVersion } from 'types/design/enums';

// utils
import { getLinePrimarySpacing } from '../getLinePrimarySpacing';

describe('getLinePrimarySpacing', () => {
  it('should use itemSpacing as the gap with no edge offset, when the gap is not auto', () => {
    const spacing = getLinePrimarySpacing({
      autoSpacing: AutoSpacing.between,
      availablePrimary: 200,
      isPrimaryGapAuto: false,
      itemSpacing: 10,
      layoutVersion: LayoutVersion.updated,
      lineChildrenCount: 2,
      linePrimarySize: 60,
    });

    expect(spacing).toEqual({ edgeOffset: 0, gap: 10 });
  });

  it('should distribute the leftover space as the gap, when the gap is auto', () => {
    const spacing = getLinePrimarySpacing({
      autoSpacing: AutoSpacing.between,
      availablePrimary: 200,
      isPrimaryGapAuto: true,
      itemSpacing: 10,
      layoutVersion: LayoutVersion.updated,
      lineChildrenCount: 2,
      linePrimarySize: 60,
    });

    // leftover 140 split across the single gap between 2 items
    expect(spacing).toEqual({ edgeOffset: 0, gap: 140 });
  });

  it('should split the leftover into edge and between-item units, for the "around" auto spacing mode', () => {
    const spacing = getLinePrimarySpacing({
      autoSpacing: AutoSpacing.around,
      availablePrimary: 200,
      isPrimaryGapAuto: true,
      itemSpacing: 0,
      layoutVersion: LayoutVersion.updated,
      lineChildrenCount: 3,
      linePrimarySize: 60,
    });
    const unit = 140 / 3;

    expect(spacing.edgeOffset).toBeCloseTo(unit / 2, 6);
    expect(spacing.gap).toBeCloseTo(unit, 6);
  });
});
