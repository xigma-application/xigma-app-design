// types
import { TDesignState } from '../../types';
import { TSceneNode } from 'types/design/types';

// utils
import { handleAddNodes } from '../handleAddNodes';

describe('handleAddNodes', () => {
  it('should store every node on the active page and append the root ids', () => {
    // mock
    const state = { activePageId: 'p', pages: { p: { nodes: {}, rootOrder: ['old'] } } } as unknown as TDesignState;
    const nodes = [{ id: 'a' }, { id: 'b' }] as TSceneNode[];

    // before
    handleAddNodes(state, { nodes, rootIds: ['a'] });

    // result
    expect(state.pages.p.nodes).toEqual({ a: nodes[0], b: nodes[1] });
    expect(state.pages.p.rootOrder).toEqual(['old', 'a']);
  });
});
