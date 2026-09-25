// types
import { TVectorNode } from 'types/design/types';

// utils
import { getVectorRegionPolygons } from '../getVectorRegionPolygons';

vi.mock('../../vectorNetwork/getVectorFillLoopPoints/getVectorFillLoopPoints', () => ({
  getVectorFillLoopPoints: (_node: unknown, key: string): unknown => (key === 'open' ? null : [{ x: 0, y: 0 }]),
}));

describe('getVectorRegionPolygons', () => {
  it('should return the polygon of every filled face that forms a closed loop', () => {
    // result
    expect(getVectorRegionPolygons({ filledFaceKeys: ['closed', 'open'] } as TVectorNode)).toEqual([[{ x: 0, y: 0 }]]);
  });
});
