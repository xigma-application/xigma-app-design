// types
import { TFrameNode } from 'types/design/types';

// utils
import { fitGridTrackCount } from '../fitGridTrackCount';
import { isGridRowsAuto } from '../isGridRowsAuto';

describe('fitGridTrackCount', () => {
  it('should keep the requested count while it fits and grow it to fit the required cells otherwise', () => {
    // result
    expect(fitGridTrackCount(2, 3, 5)).toBe(3);
    expect(fitGridTrackCount(2, 1, 5)).toBe(3);
    expect(fitGridTrackCount(0, 1, 3)).toBe(3);
  });
});

describe('isGridRowsAuto', () => {
  it('should be true only while every frame has auto rows', () => {
    // result
    expect(isGridRowsAuto([{} as TFrameNode, {} as TFrameNode])).toBe(true);
    expect(isGridRowsAuto([{} as TFrameNode, { gridRowCount: 2 } as TFrameNode])).toBe(false);
  });
});
