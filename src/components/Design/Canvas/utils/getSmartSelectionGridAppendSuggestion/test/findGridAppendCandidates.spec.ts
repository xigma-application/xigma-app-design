// types
import { TSmartSelectionNode } from 'types/design/smartSelection/types';

// utils
import { findGridAppendCandidates } from '../findGridAppendCandidates';

const cell = (id: string, x: number, y: number, width = 50, height = 50): TSmartSelectionNode => ({ bounds: { height, width, x, y }, id });

describe('findGridAppendCandidates', () => {
  it("should propose the outlier whose exclusion leaves a valid grid behind, keyed by that outlier's own id", () => {
    // 2x3 grid (a,c / d,e,f — a full 5-cell grid minus one) plus x, which sits far away and aligns with nothing
    const nodes = [cell('a', 0, 0), cell('c', 200, 0), cell('d', 0, 100), cell('e', 100, 100), cell('f', 200, 100), cell('x', 500, 500)];

    const candidates = findGridAppendCandidates(nodes, 4, 4);

    expect(candidates).toHaveLength(1);
    expect(candidates[0].outlierId).toBe('x');
    expect(candidates[0].layout.type).toBe('grid');
  });

  it('should return an empty array when no single exclusion yields a valid grid', () => {
    const nodes = [cell('a', 0, 0), cell('b', 500, 500), cell('c', 1000, 1000)];

    expect(findGridAppendCandidates(nodes, 4, 4)).toEqual([]);
  });
});
