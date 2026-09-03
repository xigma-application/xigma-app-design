// types
import { TPointAlignmentSnap } from 'components/Design/Canvas/utils/getPointAlignmentSnap';

// utils
import { maskSnapToActiveAxes } from '../maskSnapToActiveAxes';

const horizontalAxis = { anchor: { x: 10, y: 200 }, match: { x: 90, y: 200 } };
const verticalAxis = { anchor: { x: 300, y: 10 }, match: { x: 300, y: 90 } };

const bothAxisSnap: TPointAlignmentSnap = {
  guide: { horizontal: horizontalAxis, vertical: verticalAxis },
  point: { x: 300, y: 200 },
};

const QUERY = { x: 305, y: 195 };

describe('maskSnapToActiveAxes', () => {
  it('should pass the snap through untouched when both axes are active (a corner handle)', () => {
    expect(maskSnapToActiveAxes(bothAxisSnap, QUERY, true, true)).toEqual(bothAxisSnap);
  });

  it('should drop the vertical guide and un-snap x when only the height axis is active (a top/bottom handle)', () => {
    expect(maskSnapToActiveAxes(bothAxisSnap, QUERY, false, true)).toEqual({
      guide: { horizontal: horizontalAxis, vertical: null },
      point: { x: 305, y: 200 },
    });
  });

  it('should drop the horizontal guide and un-snap y when only the width axis is active (a left/right handle)', () => {
    expect(maskSnapToActiveAxes(bothAxisSnap, QUERY, true, false)).toEqual({
      guide: { horizontal: null, vertical: verticalAxis },
      point: { x: 300, y: 195 },
    });
  });

  it('should null the whole guide when the only matched axis is the masked-out one', () => {
    const verticalOnly: TPointAlignmentSnap = { guide: { horizontal: null, vertical: verticalAxis }, point: { x: 300, y: 195 } };

    expect(maskSnapToActiveAxes(verticalOnly, QUERY, false, true)).toEqual({ guide: null, point: { x: 305, y: 195 } });
  });

  it('should keep a null guide null and fully un-snap the point when neither axis is active', () => {
    expect(maskSnapToActiveAxes({ guide: null, point: { x: 300, y: 200 } }, QUERY, false, false)).toEqual({
      guide: null,
      point: { x: 305, y: 195 },
    });
  });
});
