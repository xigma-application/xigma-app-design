// types
import { AutoSpacing, LayoutVersion } from 'types/design/enums';

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

  it('should centre a lone child in a "between" auto stack under the legacy layout version', () => {
    const layout = getAutoLayoutPrimaryLayout(200, 60, 1, true, 10, AutoSpacing.between, 'start', LayoutVersion.legacy);

    // content length = 60; offset = (200 - 60) / 2 = 70
    expect(layout).toEqual({ effectiveGap: 0, offset: 70 });
  });

  it('should keep a lone child in a "between" auto stack start-aligned under the updated layout version', () => {
    const layout = getAutoLayoutPrimaryLayout(200, 60, 1, true, 10, AutoSpacing.between, 'start', LayoutVersion.updated);

    expect(layout).toEqual({ effectiveGap: 0, offset: 0 });
  });

  it('should not re-centre a lone child under legacy for the "around" or "evenly" modes', () => {
    const around = getAutoLayoutPrimaryLayout(200, 60, 1, true, 0, AutoSpacing.around, 'start', LayoutVersion.legacy);

    expect(around).toEqual({ effectiveGap: 140, offset: 70 });
  });

  it('should let the between auto gap go negative under the legacy layout version', () => {
    const layout = getAutoLayoutPrimaryLayout(50, 80, 3, true, 0, AutoSpacing.between, 'start', LayoutVersion.legacy);

    // raw leftover -30 across 2 gaps = -15
    expect(layout.effectiveGap).toBe(-15);
  });
});
