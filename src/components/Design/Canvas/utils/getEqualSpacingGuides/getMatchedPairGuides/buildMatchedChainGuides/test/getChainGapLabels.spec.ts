// types
import { TChainGeometry } from '../types';

// utils
import { getChainGapLabels } from '../getChainGapLabels';
import { getEdges } from '../../../../getDistanceGuides/getEdges';

const rect = (y: number): ReturnType<typeof getEdges> => getEdges({ height: 100, width: 200, x: 0, y });

const geometry = (gaps: number[]): TChainGeometry => ({
  activeCross: 100,
  gaps,
  spanFar: 0,
  spanNear: 0,
});

describe('getChainGapLabels', () => {
  it('should label every gap that belongs to an equal run (vertical)', () => {
    // mock
    const chain = [rect(0), rect(150), rect(300)];

    // action
    const labels = getChainGapLabels(chain, geometry([50, 50]), 'vertical', 0.5);

    // result
    expect(labels).toEqual([
      { anchor: { x: 100, y: 125 }, offsetDirection: { x: 1, y: 0 }, text: '50' },
      { anchor: { x: 100, y: 275 }, offsetDirection: { x: 1, y: 0 }, text: '50' },
    ]);
  });

  it('should not label a lone gap that has no equal neighbour', () => {
    // mock
    const chain = [rect(0), rect(150), rect(340)];

    // action
    const labels = getChainGapLabels(chain, geometry([50, 90]), 'vertical', 0.5);

    // result
    expect(labels).toHaveLength(0);
  });

  it('should label horizontal gaps along the perpendicular centre', () => {
    // mock
    const hrect = (x: number): ReturnType<typeof getEdges> => getEdges({ height: 200, width: 100, x, y: 0 });
    const chain = [hrect(0), hrect(150), hrect(300)];

    // action
    const labels = getChainGapLabels(chain, geometry([50, 50]), 'horizontal', 0.5);

    // result
    expect(labels).toEqual([
      { anchor: { x: 125, y: 100 }, offsetDirection: { x: 0, y: 1 }, text: '50' },
      { anchor: { x: 275, y: 100 }, offsetDirection: { x: 0, y: 1 }, text: '50' },
    ]);
  });
});
