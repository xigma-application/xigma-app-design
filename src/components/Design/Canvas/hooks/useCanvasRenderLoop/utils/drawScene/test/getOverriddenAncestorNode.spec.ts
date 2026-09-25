// types
import { TAutoLayoutReorderPreview } from 'types/design/canvas/types';
import { TSceneNode } from 'types/design/types';

// utils
import { getOverriddenAncestorNode } from '../getOverriddenAncestorNode';

const nodesById = {
  child: { id: 'child', parentId: 'group' },
  group: { id: 'group', parentId: 'root' },
  root: { id: 'root', parentId: null },
} as unknown as Record<string, TSceneNode>;

const previewRef = (positions: Record<string, { x: number; y: number }> | null): { current: TAutoLayoutReorderPreview | null } => ({
  current: positions ? ({ positions } as unknown as TAutoLayoutReorderPreview) : null,
});

describe('getOverriddenAncestorNode', () => {
  it('should return the node itself when the preview moves it', () => {
    // result
    expect(getOverriddenAncestorNode(previewRef({ child: { x: 1, y: 2 } }), nodesById.child, nodesById)).toEqual({
      node: nodesById.child,
      position: { x: 1, y: 2 },
    });
  });

  it('should return the nearest ancestor the preview moves', () => {
    // result
    expect(getOverriddenAncestorNode(previewRef({ group: { x: 3, y: 4 } }), nodesById.child, nodesById)).toEqual({
      node: nodesById.group,
      position: { x: 3, y: 4 },
    });
  });

  it('should return nothing when no ancestor is moved or there is no preview', () => {
    // result
    expect(getOverriddenAncestorNode(previewRef({}), nodesById.child, nodesById)).toBeUndefined();
    expect(getOverriddenAncestorNode(previewRef(null), nodesById.child, nodesById)).toBeUndefined();
  });
});
