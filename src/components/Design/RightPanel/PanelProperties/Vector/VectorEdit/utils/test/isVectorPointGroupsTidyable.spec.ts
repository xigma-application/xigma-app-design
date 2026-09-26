// types
import { TVectorPointGroup } from '../../types';

// utils
import { isVectorPointGroupsTidyable } from '../isVectorPointGroupsTidyable';

const group = (x: number, y: number): TVectorPointGroup => ({ nodeId: 'n', rect: { height: 10, width: 10, x, y }, vertexIds: [`${x}`] });

describe('isVectorPointGroupsTidyable', () => {
  it('should be true for groups tidy up would move', () => {
    // result
    expect(isVectorPointGroupsTidyable([group(0, 0), group(20, 3), group(60, 1)])).toBe(true);
  });

  it('should be false for a single group or groups already tidy', () => {
    // result
    expect(isVectorPointGroupsTidyable([group(0, 0)])).toBe(false);
    expect(isVectorPointGroupsTidyable([group(0, 0), group(20, 0)])).toBe(false);
  });
});
