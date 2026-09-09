// types
import { AutoSpacing } from 'types/design/enums';

// utils
import { getAutoLayoutPrimaryLayout } from '../getAutoLayoutPrimaryLayout';

describe('getAutoLayoutPrimaryLayout', () => {
  it('should use itemSpacing as the gap and pack at the start when the gap is not auto', () => {
    const layout = getAutoLayoutPrimaryLayout(200, 60, 2, false, 10, AutoSpacing.between, 'start');

    expect(layout).toEqual({ effectiveGap: 10, offset: 0 });
  });

  it('should centre the packed content when the align is "center" and the gap is not auto', () => {
    const layout = getAutoLayoutPrimaryLayout(200, 60, 2, false, 10, AutoSpacing.between, 'center');

    // content length = 60 + 10 = 70; offset = (200 - 70) / 2 = 65
    expect(layout).toEqual({ effectiveGap: 10, offset: 65 });
  });

  it('should distribute the leftover space as the gap and start from the edge, for the "between" auto spacing mode', () => {
    const layout = getAutoLayoutPrimaryLayout(200, 60, 2, true, 10, AutoSpacing.between, 'start');

    // leftover 140 split across the single gap between 2 items
    expect(layout).toEqual({ effectiveGap: 140, offset: 0 });
  });

  it('should split the leftover into edge and between-item units, for the "around" auto spacing mode', () => {
    const layout = getAutoLayoutPrimaryLayout(200, 60, 3, true, 0, AutoSpacing.around, 'start');
    const unit = 140 / 3;

    expect(layout.effectiveGap).toBeCloseTo(unit, 6);
    expect(layout.offset).toBeCloseTo(unit / 2, 6);
  });
});
