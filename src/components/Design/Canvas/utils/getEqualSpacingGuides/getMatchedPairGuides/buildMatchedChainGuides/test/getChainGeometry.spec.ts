// utils
import { getChainGeometry } from '../getChainGeometry';
import { getEdges } from '../../../../getDistanceGuides/getEdges';

const rect = (y: number): ReturnType<typeof getEdges> => getEdges({ height: 100, width: 200, x: 0, y });

describe('getChainGeometry', () => {
  it('should measure the vertical chain span and the perpendicular centre of the active shape', () => {
    // mock — 3 shapes, equal 50px gaps
    const chain = [rect(0), rect(150), rect(300)];

    // action
    const geometry = getChainGeometry(chain[2], chain, 'vertical');

    // result
    expect(geometry).toEqual({
      activeCross: 100,
      gaps: [50, 50],
      spanFar: 400,
      spanNear: 0,
    });
  });

  it('should keep the span independent of where the active shape sits in the chain', () => {
    // mock
    const chain = [rect(0), rect(150), rect(300)];

    // action
    const geometry = getChainGeometry(chain[0], chain, 'vertical');

    // result — first shape active, span still runs the whole chain
    expect(geometry.spanNear).toBe(0);
    expect(geometry.spanFar).toBe(400);
  });

  it('should measure the horizontal chain', () => {
    // mock
    const hrect = (x: number): ReturnType<typeof getEdges> => getEdges({ height: 200, width: 100, x, y: 0 });
    const chain = [hrect(0), hrect(150), hrect(300)];

    // action
    const geometry = getChainGeometry(chain[2], chain, 'horizontal');

    // result
    expect(geometry).toEqual({
      activeCross: 100,
      gaps: [50, 50],
      spanFar: 400,
      spanNear: 0,
    });
  });
});
