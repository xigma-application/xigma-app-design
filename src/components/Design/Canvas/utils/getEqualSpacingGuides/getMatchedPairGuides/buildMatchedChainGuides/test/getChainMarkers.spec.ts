// types
import { TChainGeometry } from '../types';

// utils
import { getChainMarkers } from '../getChainMarkers';
import { getEdges } from '../../../../getDistanceGuides/getEdges';

const GEOMETRY: TChainGeometry = {
  activeCross: 100,
  gaps: [],
  spanFar: 550,
  spanNear: 0,
};

describe('getChainMarkers', () => {
  it('should mark all four corners of every chain shape plus both centre-axis ends (vertical)', () => {
    // mock
    const chain = [getEdges({ height: 100, width: 200, x: 0, y: 0 }), getEdges({ height: 100, width: 200, x: 0, y: 150 })];

    // action
    const markers = getChainMarkers(chain, GEOMETRY, 'vertical');

    // result — 4 corners × 2 shapes + 2 centre-axis ends
    expect(markers).toHaveLength(10);
    expect(markers.slice(-2)).toEqual([
      { x: 100, y: 0 },
      { x: 100, y: 550 },
    ]);
  });

  it('should place the centre-axis ends on the horizontal axis', () => {
    // mock
    const chain = [getEdges({ height: 200, width: 100, x: 0, y: 0 })];

    // action
    const markers = getChainMarkers(chain, GEOMETRY, 'horizontal');

    // result
    expect(markers.slice(-2)).toEqual([
      { x: 0, y: 100 },
      { x: 550, y: 100 },
    ]);
  });
});
