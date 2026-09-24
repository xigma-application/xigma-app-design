// types
import { TBoxSceneNode } from 'types/design/types';

// utils
import { getBoundDisplayValue } from '../getBoundDisplayValue';
import { hasBoundOnEvery } from '../hasBoundOnEvery';
import { hasBoundOnSome } from '../hasBoundOnSome';

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

describe('hasBoundOnSome / hasBoundOnEvery', () => {
  it('should tell whether any or every node has the bound', () => {
    // result
    expect(hasBoundOnSome([node(10), node()], 'minWidth')).toBe(true);
    expect(hasBoundOnEvery([node(10), node()], 'minWidth')).toBe(false);
    expect(hasBoundOnEvery([node(10), node(20)], 'minWidth')).toBe(true);
    expect(hasBoundOnEvery([], 'minWidth')).toBe(false);
    expect(hasBoundOnSome([], 'minWidth')).toBe(false);
  });
});
