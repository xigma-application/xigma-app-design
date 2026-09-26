// utils
import { getDrawnVectorNode } from '../getDrawnVectorNode';
import { makeSquareVector } from 'utils/canvas/vector/stroke/test/fixtures';

describe('getDrawnVectorNode', () => {
  it('should turn and round a vector the way it is drawn', () => {
    // before
    const drawn = getDrawnVectorNode(makeSquareVector({ cornerRadius: 10, rotation: 45 }));

    // result
    expect(drawn.rotation).toBe(0);
    expect(Object.keys(drawn.segments)).toHaveLength(8);
  });
});
