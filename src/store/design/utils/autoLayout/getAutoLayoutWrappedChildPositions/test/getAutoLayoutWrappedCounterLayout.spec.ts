// utils
import { getAutoLayoutWrappedCounterLayout } from '../getAutoLayoutWrappedCounterLayout';

const lines = [[{ height: 20, id: 'a', width: 10 }], [{ height: 30, id: 'b', width: 10 }]];

describe('getAutoLayoutWrappedCounterLayout', () => {
  it('should use counterAxisSpacing as the gap and pack lines at the start, when the counter gap is not auto', () => {
    const layout = getAutoLayoutWrappedCounterLayout(true, lines, false, false, 5, 100, 'start');

    expect(layout).toEqual({ counterOffset: 0, effectiveCounterGap: 5, lineThicknesses: [20, 30] });
  });

  it('should centre the block of lines when the counter align is "center" and the gap is not auto', () => {
    const layout = getAutoLayoutWrappedCounterLayout(true, lines, false, false, 5, 100, 'center');

    // block length = 20 + 5 + 30 = 55; offset = (100 - 55) / 2 = 22.5
    expect(layout).toEqual({ counterOffset: 22.5, effectiveCounterGap: 5, lineThicknesses: [20, 30] });
  });

  it('should distribute the leftover space between lines and start from the edge, when the counter gap is auto', () => {
    const layout = getAutoLayoutWrappedCounterLayout(true, lines, false, true, 999, 100, 'start');

    // leftover 50 split across the single gap between 2 lines
    expect(layout).toEqual({ counterOffset: 0, effectiveCounterGap: 50, lineThicknesses: [20, 30] });
  });
});
