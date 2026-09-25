// types
import { TFrameNode } from 'types/design/types';

// utils
import { isGridRowsAuto } from '../isGridRowsAuto';

describe('isGridRowsAuto', () => {
  it('should be true only when no grid fixes its row count', () => {
    // result
    expect(isGridRowsAuto([{} as TFrameNode, {} as TFrameNode])).toBe(true);
    expect(isGridRowsAuto([{} as TFrameNode, { gridRowCount: 2 } as TFrameNode])).toBe(false);
  });
});
