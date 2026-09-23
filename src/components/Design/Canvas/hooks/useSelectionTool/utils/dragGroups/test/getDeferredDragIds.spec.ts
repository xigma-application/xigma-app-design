// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { getDeferredDragIds } from '../getDeferredDragIds';

const frame = (id: string, layoutMode?: LayoutMode): TSceneNode =>
  ({ childIds: [], height: 10, id, layoutMode, parentId: null, type: NodeType.frame, width: 10, x: 0, y: 0 }) as unknown as TSceneNode;

const rect = (id: string, parentId: string | null): TSceneNode =>
  ({ height: 10, id, parentId, type: NodeType.rectangle, width: 10, x: 0, y: 0 }) as unknown as TSceneNode;

describe('getDeferredDragIds', () => {
  it('should return the id set of deferred nodes only', () => {
    // mock
    const grabbed = rect('g', 'vertical');
    const listed = rect('l', 'horizontal');
    const freeform = rect('f', 'free');
    const nodesById = {
      f: freeform,
      free: frame('free'),
      g: grabbed,
      horizontal: frame('horizontal', LayoutMode.horizontal),
      l: listed,
      vertical: frame('vertical', LayoutMode.vertical),
    };

    // result
    expect(getDeferredDragIds([grabbed, listed, freeform], [grabbed], nodesById)).toEqual(new Set(['l']));
  });
});
