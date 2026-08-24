// utils
import { isVectorWidthHandleSelected } from '../isVectorWidthHandleSelected';

describe('isVectorWidthHandleSelected', () => {
  it('should be true when a selection entry matches node, point, and side exactly', () => {
    // result
    expect(isVectorWidthHandleSelected([{ nodeId: 'n1', pointId: 'p1', side: 'left' }], 'n1', 'p1', 'left')).toBe(true);
  });

  it('should be false when the side does not match', () => {
    // result
    expect(isVectorWidthHandleSelected([{ nodeId: 'n1', pointId: 'p1', side: 'left' }], 'n1', 'p1', 'right')).toBe(false);
  });

  it('should be false when the point id does not match', () => {
    // result
    expect(isVectorWidthHandleSelected([{ nodeId: 'n1', pointId: 'p1', side: 'left' }], 'n1', 'p2', 'left')).toBe(false);
  });

  it('should be false when the node id does not match', () => {
    // result
    expect(isVectorWidthHandleSelected([{ nodeId: 'n1', pointId: 'p1', side: 'left' }], 'n2', 'p1', 'left')).toBe(false);
  });

  it('should be false for an empty selection', () => {
    // result
    expect(isVectorWidthHandleSelected([], 'n1', 'p1', 'left')).toBe(false);
  });
});
