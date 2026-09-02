// utils
import { filterRowCandidates } from '../filterRowCandidates';
import { getEdges } from '../../getDistanceGuides/getEdges';

const ACTIVE = getEdges({ height: 50, width: 20, x: 0, y: 0 });

describe('filterRowCandidates', () => {
  it('should keep candidates with the same height as active', () => {
    // mock
    const sameHeight = { bounds: { height: 50, width: 80, x: 100, y: 0 } };
    const differentHeight = { bounds: { height: 90, width: 80, x: 200, y: 0 } };

    // action
    const result = filterRowCandidates(ACTIVE, [sameHeight, differentHeight]);

    // result
    expect(result).toEqual([sameHeight]);
  });

  it('should keep a candidate within the tight size-match tolerance', () => {
    // mock — 0.2px off, within GRID_CELL_SIZE_MATCH_TOLERANCE_PX (0.5)
    const almostSameHeight = { bounds: { height: 50.2, width: 80, x: 100, y: 0 } };

    // action
    const result = filterRowCandidates(ACTIVE, [almostSameHeight]);

    // result
    expect(result).toEqual([almostSameHeight]);
  });

  it('should return an empty array when nothing matches', () => {
    // action
    const result = filterRowCandidates(ACTIVE, [{ bounds: { height: 90, width: 80, x: 200, y: 0 } }]);

    // result
    expect(result).toEqual([]);
  });
});
