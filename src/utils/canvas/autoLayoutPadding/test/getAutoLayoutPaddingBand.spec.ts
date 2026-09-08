// utils
import { getAutoLayoutPaddingBand } from '../getAutoLayoutPaddingBand';

const frame = { height: 200, width: 300, x: 10, y: 20 };
const padding = { paddingBottom: 8, paddingLeft: 5, paddingRight: 15, paddingTop: 12 };

describe('getAutoLayoutPaddingBand', () => {
  it('should span the full frame height for the left band', () => {
    // result
    expect(getAutoLayoutPaddingBand(frame, padding, 'left')).toEqual({ height: 200, width: 5, x: 10, y: 20 });
  });

  it('should hug the right edge for the right band', () => {
    // result
    expect(getAutoLayoutPaddingBand(frame, padding, 'right')).toEqual({ height: 200, width: 15, x: 295, y: 20 });
  });

  it('should span the full frame width for the top band', () => {
    // result
    expect(getAutoLayoutPaddingBand(frame, padding, 'top')).toEqual({ height: 12, width: 300, x: 10, y: 20 });
  });

  it('should hug the bottom edge for the bottom band', () => {
    // result
    expect(getAutoLayoutPaddingBand(frame, padding, 'bottom')).toEqual({ height: 8, width: 300, x: 10, y: 212 });
  });

  it('should return a zero-width band when the padding value is 0', () => {
    // result
    expect(getAutoLayoutPaddingBand(frame, { ...padding, paddingLeft: 0 }, 'left')).toEqual({ height: 200, width: 0, x: 10, y: 20 });
  });
});
