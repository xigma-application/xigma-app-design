// utils
import { getEdges } from '../getEdges';

describe('getEdges', () => {
  it('should convert a rect into its four absolute edge coordinates', () => {
    // before
    const edges = getEdges({ height: 30, width: 50, x: 20, y: 10 });

    // result
    expect(edges).toEqual({ bottom: 40, left: 20, right: 70, top: 10 });
  });
});
