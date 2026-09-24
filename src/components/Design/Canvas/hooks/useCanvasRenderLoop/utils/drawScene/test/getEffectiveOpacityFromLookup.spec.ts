// types
import { TSceneNode } from 'types/design/types';

// utils
import { getEffectiveOpacityFromLookup } from '../getEffectiveOpacityFromLookup';

const box = (id: string, parentId: string | null, opacity?: number): TSceneNode =>
  ({ id, opacity, parentId, type: 'frame', x: 0, y: 0 }) as unknown as TSceneNode;

describe('getEffectiveOpacityFromLookup', () => {
  it('should multiply the opacity of the node with every ancestor found through the lookup', () => {
    // mock
    const nodes: Record<string, TSceneNode> = { child: box('child', 'parent', 0.5), parent: box('parent', null, 0.5) };

    // before
    const opacity = getEffectiveOpacityFromLookup(nodes.child, (id) => nodes[id]);

    // result
    expect(opacity).toBe(0.25);
  });

  it('should treat a missing opacity as fully opaque and stop at a missing ancestor', () => {
    // before
    const opacity = getEffectiveOpacityFromLookup(box('child', 'gone'), () => undefined);

    // result
    expect(opacity).toBe(1);
  });

  it('should ignore the opacity of a node that is not a box', () => {
    // mock
    const line = { id: 'l', opacity: 0.1, parentId: null, type: 'line' } as unknown as TSceneNode;

    // before
    const opacity = getEffectiveOpacityFromLookup(line, () => undefined);

    // result
    expect(opacity).toBe(1);
  });
});
