// types
import { TSmartSelectionNode } from 'types/design/smartSelection/types';

// utils
import { buildAlignedSequenceCandidate } from '../buildAlignedSequenceCandidate';

const node = (id: string, x: number, width: number, y = 0, height = 100): TSmartSelectionNode => ({ bounds: { height, width, x, y }, id });

describe('buildAlignedSequenceCandidate', () => {
  it('should sort nodes along the axis and compute gap values, uniform or not', () => {
    const candidate = buildAlignedSequenceCandidate([node('b', 150, 40), node('a', 0, 100), node('c', 240, 80)], 'x');

    expect(candidate?.sorted.map((n) => n.id)).toEqual(['a', 'b', 'c']);
    expect(candidate?.gapValues).toEqual([50, 50]);
  });

  it('should not gate on gap uniformity', () => {
    const candidate = buildAlignedSequenceCandidate([node('a', 0, 100), node('b', 140, 100), node('c', 400, 100)], 'x');

    expect(candidate?.gapValues).toEqual([40, 160]);
  });

  it('should reject overlapping (negative-gap) neighbours', () => {
    expect(buildAlignedSequenceCandidate([node('a', 0, 100), node('b', 80, 100)], 'x')).toBeNull();
  });

  it('should reject nodes with no perpendicular band overlap', () => {
    expect(buildAlignedSequenceCandidate([node('a', 0, 50, 0, 50), node('b', 100, 50, 200, 50)], 'x')).toBeNull();
  });

  it('should work along the y axis', () => {
    const candidate = buildAlignedSequenceCandidate([node('b', 0, 100, 150, 40), node('a', 0, 100, 0, 100)], 'y');

    expect(candidate?.sorted.map((n) => n.id)).toEqual(['a', 'b']);
    expect(candidate?.gapValues).toEqual([50]);
  });
});
