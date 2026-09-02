// utils
import { getAxisEdges } from '../getAxisEdges';
import { getEdges } from '../../../../getDistanceGuides/getEdges';

const EDGES = getEdges({ height: 100, width: 200, x: 10, y: 20 });

describe('getAxisEdges', () => {
  it('should read the vertical axis (near/far = top/bottom, breadth = width)', () => {
    expect(getAxisEdges(EDGES, 'vertical')).toEqual({
      breadth: 200,
      centre: 110,
      far: 120,
      length: 100,
      near: 20,
    });
  });

  it('should read the horizontal axis (near/far = left/right, breadth = height)', () => {
    expect(getAxisEdges(EDGES, 'horizontal')).toEqual({
      breadth: 100,
      centre: 70,
      far: 210,
      length: 200,
      near: 10,
    });
  });
});
