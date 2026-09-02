// types
import { TChainGeometry } from '../types';

// utils
import { getChainMarkers } from '../getChainMarkers';
import { getEdges } from '../../../../getDistanceGuides/getEdges';

const GEOMETRY: TChainGeometry = {
  activeCentre: 500,
  activeCross: 100,
  centreLineFar: 0,
  gaps: [],
  spanFar: 0,
  spanNear: 0,
};

describe('getChainMarkers', () => {
  it('should mark all four corners of every chain shape plus both centre-line ends (vertical)', () => {
    // mock
    const chain = [getEdges({ height: 100, width: 200, x: 0, y: 0 }), getEdges({ height: 100, width: 200, x: 0, y: 150 })];

    // action
    const markers = getChainMarkers(chain, GEOMETRY, 'vertical');

    // result — 4 corners × 2 shapes + 2 centre-line ends
    expect(markers).toHaveLength(10);
    expect(markers.slice(-2)).toEqual([
      { x: 100, y: 500 },
      { x: 100, y: 0 },
    ]);
  });

  it('should place the centre-line ends on the horizontal axis', () => {
    // mock
    const chain = [getEdges({ height: 200, width: 100, x: 0, y: 0 })];

    // action
    const markers = getChainMarkers(chain, GEOMETRY, 'horizontal');

    // result
    expect(markers.slice(-2)).toEqual([
      { x: 500, y: 100 },
      { x: 0, y: 100 },
    ]);
  });
});
