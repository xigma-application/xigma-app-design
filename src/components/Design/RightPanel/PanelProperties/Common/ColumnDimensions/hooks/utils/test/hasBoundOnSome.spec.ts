// types
import { TBoxSceneNode } from 'types/design/types';

// utils
import { hasBoundOnSome } from '../hasBoundOnSome';

const node = (minWidth?: number): TBoxSceneNode => ({ minWidth }) as TBoxSceneNode;

describe('hasBoundOnSome', () => {
  it('should tell whether any node has the bound', () => {
    // result
    expect(hasBoundOnSome([node(10), node()], 'minWidth')).toBe(true);
    expect(hasBoundOnSome([node(), node()], 'minWidth')).toBe(false);
    expect(hasBoundOnSome([], 'minWidth')).toBe(false);
  });
});
