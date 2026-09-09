// types
import { TAutoLayoutChildSize } from '../../../getAutoLayoutChildPositions/getAutoLayoutChildPositions';
import { TGridCellPlacement } from '../../types';

// utils
import { getGridContentMaxPerTrack } from '../getGridContentMaxPerTrack';

const placement = (overrides: Partial<TGridCellPlacement> = {}): TGridCellPlacement => ({
  columnSpan: 1,
  columnStart: 0,
  id: 'a',
  rowSpan: 1,
  rowStart: 0,
  ...overrides,
});

const size = (overrides: Partial<TAutoLayoutChildSize> = {}): TAutoLayoutChildSize => ({
  height: 10,
  id: 'a',
  width: 10,
  ...overrides,
});

describe('getGridContentMaxPerTrack behaviors', () => {
  it('should keep the widest single-column child per column track', () => {
    // mock
    const placements = [placement({ columnStart: 0 }), placement({ columnStart: 0 }), placement({ columnStart: 1 })];
    const sizes = [size({ width: 20 }), size({ width: 50 }), size({ width: 30 })];

    // before
    const maxes = getGridContentMaxPerTrack(placements, sizes, 2, true);

    // result
    expect(maxes).toEqual([50, 30]);
  });

  it('should keep the tallest single-row child per row track', () => {
    // mock
    const placements = [placement({ rowStart: 0 }), placement({ rowStart: 1 }), placement({ rowStart: 1 })];
    const sizes = [size({ height: 15 }), size({ height: 40 }), size({ height: 25 })];

    // before
    const maxes = getGridContentMaxPerTrack(placements, sizes, 2, false);

    // result
    expect(maxes).toEqual([15, 40]);
  });

  it('should ignore a child that spans more than one track', () => {
    // mock
    const placements = [placement({ columnSpan: 2, columnStart: 0 })];
    const sizes = [size({ width: 300 })];

    // before
    const maxes = getGridContentMaxPerTrack(placements, sizes, 2, true);

    // result
    expect(maxes).toEqual([0, 0]);
  });

  it('should leave untouched tracks at zero', () => {
    // before
    const maxes = getGridContentMaxPerTrack([], [], 3, true);

    // result
    expect(maxes).toEqual([0, 0, 0]);
  });
});
