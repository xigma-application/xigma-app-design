// types
import { TRectangleNode, TSceneNode } from 'types/design/types';

// utils
import { getRunBaseOpacity } from '../getRunBaseOpacity';

const rect = (parentId: string | null): TRectangleNode =>
  ({ id: 'r', parentId, type: 'rectangle', x: 0, y: 0 }) as unknown as TRectangleNode;

describe('getRunBaseOpacity', () => {
  it('should be fully opaque for a run without a parent', () => {
    // result
    expect(getRunBaseOpacity([rect(null)], () => undefined)).toBe(1);
  });

  it('should be fully opaque when the parent cannot be found', () => {
    // result
    expect(getRunBaseOpacity([rect('gone')], () => undefined)).toBe(1);
  });

  it('should use the effective opacity of the parent chain', () => {
    // mock
    const grandparent = { id: 'g', opacity: 0.5, parentId: null, type: 'frame', x: 0, y: 0 } as unknown as TSceneNode;
    const parent = { id: 'p', opacity: 0.5, parentId: 'g', type: 'frame', x: 0, y: 0 } as unknown as TSceneNode;
    const nodes: Record<string, TSceneNode> = { g: grandparent, p: parent };

    // before
    const opacity = getRunBaseOpacity([rect('p')], (id) => nodes[id]);

    // result
    expect(opacity).toBe(0.25);
  });
});
