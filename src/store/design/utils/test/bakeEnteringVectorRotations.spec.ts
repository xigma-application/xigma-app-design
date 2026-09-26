// types
import { NodeType } from 'types/design/enums';
import { TDesignState } from '../../types';
import { TSceneNode, TVectorNode } from 'types/design/types';

// utils
import { bakeEnteringVectorRotations } from '../bakeEnteringVectorRotations';
import { makeSquareVector } from 'utils/canvas/vector/stroke/test/fixtures';

const buildState = (nodes: Record<string, TSceneNode>): TDesignState =>
  ({ activePageId: 'page', pages: { page: { nodes } } }) as unknown as TDesignState;

describe('bakeEnteringVectorRotations', () => {
  it('should bake the rotation of a rotated vector entering edit mode and keep the turn for its fill', () => {
    // mock
    const state = buildState({ turned: makeSquareVector({ id: 'turned', rotation: 90 }) });

    // before
    bakeEnteringVectorRotations(state, ['turned']);

    // result
    const node = state.pages.page.nodes.turned as TVectorNode;

    expect(node.rotation).toBe(0);
    expect(node.fillRotation).toBe(90);
  });

  it('should leave unrotated vectors, other layers and missing ids alone', () => {
    // mock
    const straight = makeSquareVector({ id: 'straight' });
    const frame = { id: 'frame', rotation: 45, type: NodeType.frame } as TSceneNode;
    const state = buildState({ frame, straight });

    // before
    bakeEnteringVectorRotations(state, ['straight', 'frame', 'missing']);

    // result
    expect(state.pages.page.nodes.straight).toBe(straight);
    expect(state.pages.page.nodes.frame).toBe(frame);
  });
});
