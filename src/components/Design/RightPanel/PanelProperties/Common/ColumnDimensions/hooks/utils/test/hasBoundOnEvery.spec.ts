// types
import { TBoxSceneNode } from 'types/design/types';

// utils
import { hasBoundOnEvery } from '../hasBoundOnEvery';

const node = (minWidth?: number): TBoxSceneNode => ({ minWidth }) as TBoxSceneNode;

describe('hasBoundOnEvery', () => {
  it('should tell whether every node has the bound', () => {
    // result
    expect(hasBoundOnEvery([node(10), node()], 'minWidth')).toBe(false);
    expect(hasBoundOnEvery([node(10), node(20)], 'minWidth')).toBe(true);
    expect(hasBoundOnEvery([], 'minWidth')).toBe(false);
  });
});
