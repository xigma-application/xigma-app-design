// types
import { TBoxSceneNode } from 'types/design/types';

// utils
import { getBoundDisplayValue } from '../getBoundDisplayValue';

const node = (minWidth?: number): TBoxSceneNode => ({ minWidth }) as TBoxSceneNode;

describe('getBoundDisplayValue', () => {
  it('should return the shared value, undefined when nobody has it, and the Mixed label otherwise', () => {
    // result
    expect(getBoundDisplayValue([node(10), node(10)], 'minWidth', 'Mixed')).toBe(10);
    expect(getBoundDisplayValue([node(), node()], 'minWidth', 'Mixed')).toBeUndefined();
    expect(getBoundDisplayValue([node(10), node(20)], 'minWidth', 'Mixed')).toBe('Mixed');
    expect(getBoundDisplayValue([node(10), node()], 'minWidth', 'Mixed')).toBe('Mixed');
    expect(getBoundDisplayValue([], 'minWidth', 'Mixed')).toBeUndefined();
  });
});
