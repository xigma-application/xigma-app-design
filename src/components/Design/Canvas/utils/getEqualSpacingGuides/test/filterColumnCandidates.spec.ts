// utils
import { filterColumnCandidates } from '../filterColumnCandidates';
import { getEdges } from '../../getDistanceGuides/getEdges';

const ACTIVE = getEdges({ height: 20, width: 50, x: 0, y: 0 });

describe('filterColumnCandidates', () => {
  it('should keep candidates with the same width as active', () => {
    // mock
    const sameWidth = { bounds: { height: 80, width: 50, x: 0, y: 100 } };
    const differentWidth = { bounds: { height: 80, width: 90, x: 0, y: 200 } };

    // action
    const result = filterColumnCandidates(ACTIVE, [sameWidth, differentWidth]);

    // result
    expect(result).toEqual([sameWidth]);
  });

  it('should keep a candidate within the tight size-match tolerance', () => {
    // mock — 0.2px off, within GRID_CELL_SIZE_MATCH_TOLERANCE_PX (0.5)
    const almostSameWidth = { bounds: { height: 80, width: 50.2, x: 0, y: 100 } };

    // action
    const result = filterColumnCandidates(ACTIVE, [almostSameWidth]);

    // result
    expect(result).toEqual([almostSameWidth]);
  });

  it('should return an empty array when nothing matches', () => {
    // action
    const result = filterColumnCandidates(ACTIVE, [{ bounds: { height: 80, width: 90, x: 0, y: 200 } }]);

    // result
    expect(result).toEqual([]);
  });
});
