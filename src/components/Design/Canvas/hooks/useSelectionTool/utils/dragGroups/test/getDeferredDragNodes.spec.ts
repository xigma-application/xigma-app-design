// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { getDeferredDragNodes } from '../getDeferredDragNodes';

const frame = (id: string, layoutMode?: LayoutMode): TSceneNode =>
  ({ childIds: [], height: 10, id, layoutMode, parentId: null, type: NodeType.frame, width: 10, x: 0, y: 0 }) as unknown as TSceneNode;

const rect = (id: string, parentId: string | null): TSceneNode =>
  ({ height: 10, id, parentId, type: NodeType.rectangle, width: 10, x: 0, y: 0 }) as unknown as TSceneNode;

describe('getDeferredDragNodes', () => {
  it('should return only the selected flow-managed nodes outside the grabbed group', () => {
    // mock
    const grabbed = rect('g', 'vertical');
    const listed = rect('l', 'horizontal');
    const freeform = rect('f', 'free');
    const root = rect('r', null);
    const nodesById = {
      free: frame('free'),
      horizontal: frame('horizontal', LayoutMode.horizontal),
      vertical: frame('vertical', LayoutMode.vertical),
    };

    // result
    expect(getDeferredDragNodes([grabbed, listed, freeform, root], [grabbed], nodesById)).toEqual([listed]);
  });
});
