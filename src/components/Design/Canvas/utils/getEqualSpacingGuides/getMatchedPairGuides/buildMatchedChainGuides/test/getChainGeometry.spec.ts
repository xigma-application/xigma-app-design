// utils
import { getChainGeometry } from '../getChainGeometry';
import { getEdges } from '../../../../getDistanceGuides/getEdges';

const rect = (y: number): ReturnType<typeof getEdges> => getEdges({ height: 100, width: 200, x: 0, y });

describe('getChainGeometry', () => {
  it('should measure the vertical chain and run the centre line to the near edge when active sits at the far end', () => {
    // mock — active is the last of 3, equal 50px gaps
    const chain = [rect(0), rect(150), rect(300)];

    // action
    const geometry = getChainGeometry(chain[2], chain, 'vertical');

    // result
    expect(geometry).toEqual({
      activeCentre: 350,
      activeCross: 100,
      centreLineFar: 0,
      gaps: [50, 50],
      spanFar: 400,
      spanNear: 0,
    });
  });

  it('should run the centre line to the far edge when active sits at the near end', () => {
    // mock — active is the first of 3
    const chain = [rect(0), rect(150), rect(300)];

    // action
    const geometry = getChainGeometry(chain[0], chain, 'vertical');

    // result — activeIndex 0, 0 >= 2 is false → centreLineFar = spanFar
    expect(geometry.centreLineFar).toBe(400);
  });

  it('should measure the horizontal chain', () => {
    // mock
    const hrect = (x: number): ReturnType<typeof getEdges> => getEdges({ height: 200, width: 100, x, y: 0 });
    const chain = [hrect(0), hrect(150), hrect(300)];

    // action
    const geometry = getChainGeometry(chain[2], chain, 'horizontal');

    // result
    expect(geometry).toEqual({
      activeCentre: 350,
      activeCross: 100,
      centreLineFar: 0,
      gaps: [50, 50],
      spanFar: 400,
      spanNear: 0,
    });
  });
});
