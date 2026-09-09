// types
import { StrokeAlign } from 'types/design/enums';

// utils
import { getStrokeAlignInset } from '../getStrokeAlignInset';

describe('getStrokeAlignInset', () => {
  it('should split the width evenly for a centered stroke', () => {
    expect(getStrokeAlignInset(8, StrokeAlign.center)).toEqual({ inner: 4, outer: 4 });
  });

  it('should default to a centered stroke when no alignment is given', () => {
    expect(getStrokeAlignInset(8)).toEqual({ inner: 4, outer: 4 });
  });

  it('should push the whole width inward for an inside stroke', () => {
    expect(getStrokeAlignInset(8, StrokeAlign.inside)).toEqual({ inner: 8, outer: 0 });
  });

  it('should push the whole width outward for an outside stroke', () => {
    expect(getStrokeAlignInset(8, StrokeAlign.outside)).toEqual({ inner: 0, outer: 8 });
  });
});
