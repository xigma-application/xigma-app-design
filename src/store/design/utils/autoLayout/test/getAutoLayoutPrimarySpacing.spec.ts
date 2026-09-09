// types
import { AutoSpacing, LayoutVersion } from 'types/design/enums';

// utils
import { getAutoLayoutPrimarySpacing } from '../getAutoLayoutPrimarySpacing';

describe('getAutoLayoutPrimarySpacing', () => {
  it('should return zero edge offset and gap for an empty row, regardless of mode', () => {
    expect(getAutoLayoutPrimarySpacing(200, 0, 0, AutoSpacing.between)).toEqual({ edgeOffset: 0, gap: 0 });
    expect(getAutoLayoutPrimarySpacing(200, 0, 0, AutoSpacing.around)).toEqual({ edgeOffset: 0, gap: 0 });
    expect(getAutoLayoutPrimarySpacing(200, 0, 0, AutoSpacing.evenly)).toEqual({ edgeOffset: 0, gap: 0 });
  });

  describe('between', () => {
    it('should pack items flush to the edges and put all leftover space between them', () => {
      // 200 available, 60 total item size, 3 items -> leftover 140 split across 2 gaps = 70
      expect(getAutoLayoutPrimarySpacing(200, 60, 3, AutoSpacing.between)).toEqual({ edgeOffset: 0, gap: 70 });
    });

    it('should have no gap for a single item, matching the plain distributed-gap behaviour', () => {
      expect(getAutoLayoutPrimarySpacing(200, 60, 1, AutoSpacing.between)).toEqual({ edgeOffset: 0, gap: 0 });
    });

    it('should clamp to zero when items overflow the available space', () => {
      expect(getAutoLayoutPrimarySpacing(50, 60, 3, AutoSpacing.between)).toEqual({ edgeOffset: 0, gap: 0 });
    });
  });

  describe('evenly', () => {
    it('should split the leftover into equal units for every gap, including both edges', () => {
      // leftover 140 split into (3 items + 1) = 4 equal units of 35
      expect(getAutoLayoutPrimarySpacing(200, 60, 3, AutoSpacing.evenly)).toEqual({ edgeOffset: 35, gap: 35 });
    });

    it('should centre a single item, splitting the leftover into two equal edges', () => {
      expect(getAutoLayoutPrimarySpacing(200, 60, 1, AutoSpacing.evenly)).toEqual({ edgeOffset: 70, gap: 70 });
    });
  });

  describe('around', () => {
    it('should make the between-item gap twice the size of each edge, a 2:1 ratio', () => {
      // leftover 140 / 3 items = 46.666 unit; edge = unit/2, gap = unit
      const unit = 140 / 3;

      expect(getAutoLayoutPrimarySpacing(200, 60, 3, AutoSpacing.around)).toEqual({ edgeOffset: unit / 2, gap: unit });
    });

    it('should centre a single item, since its two half-edges combine into full edges of equal size', () => {
      expect(getAutoLayoutPrimarySpacing(200, 60, 1, AutoSpacing.around)).toEqual({ edgeOffset: 70, gap: 140 });
    });
  });

  describe('legacy layout version', () => {
    it('should let the between gap go negative when items overflow the available space', () => {
      // 50 available, 80 total, 3 items -> raw leftover -30 across 2 gaps = -15
      expect(getAutoLayoutPrimarySpacing(50, 80, 3, AutoSpacing.between, LayoutVersion.legacy)).toEqual({ edgeOffset: 0, gap: -15 });
    });

    it('should let the evenly units go negative on overflow', () => {
      // raw leftover -30 / (3 + 1) = -7.5
      expect(getAutoLayoutPrimarySpacing(50, 80, 3, AutoSpacing.evenly, LayoutVersion.legacy)).toEqual({
        edgeOffset: -7.5,
        gap: -7.5,
      });
    });

    it('should still clamp under the updated layout version', () => {
      expect(getAutoLayoutPrimarySpacing(50, 80, 3, AutoSpacing.between, LayoutVersion.updated)).toEqual({ edgeOffset: 0, gap: 0 });
    });
  });
});
