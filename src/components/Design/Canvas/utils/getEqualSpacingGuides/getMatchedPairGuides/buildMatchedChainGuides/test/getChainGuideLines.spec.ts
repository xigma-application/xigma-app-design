// types
import { TChainGeometry } from '../types';

// utils
import { getChainGuideLines } from '../getChainGuideLines';
import { getEdges } from '../../../../getDistanceGuides/getEdges';

const GEOMETRY: TChainGeometry = {
  activeCross: 100,
  gaps: [],
  spanFar: 550,
  spanNear: 0,
};

describe('getChainGuideLines', () => {
  it('should draw the centre axis plus both side edges, all spanning the whole vertical chain', () => {
    // mock
    const active = getEdges({ height: 100, width: 200, x: 0, y: 450 });

    // action + result
    expect(getChainGuideLines(active, GEOMETRY, 'vertical')).toEqual([
      { dashed: false, x1: 100, x2: 100, y1: 0, y2: 550 },
      { dashed: false, x1: 0, x2: 0, y1: 0, y2: 550 },
      { dashed: false, x1: 200, x2: 200, y1: 0, y2: 550 },
    ]);
  });

  it('should mirror onto the horizontal axis', () => {
    // mock
    const active = getEdges({ height: 200, width: 100, x: 450, y: 0 });

    // action + result
    expect(getChainGuideLines(active, GEOMETRY, 'horizontal')).toEqual([
      { dashed: false, x1: 0, x2: 550, y1: 100, y2: 100 },
      { dashed: false, x1: 0, x2: 550, y1: 0, y2: 0 },
      { dashed: false, x1: 0, x2: 550, y1: 200, y2: 200 },
    ]);
  });
});
