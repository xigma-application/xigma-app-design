// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TAutoLayoutFrame } from '../types';
import { TSceneNode } from 'types/design/types';

// utils
import { armAutoLayoutDropTarget } from '../armAutoLayoutDropTarget';
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';

const autoLayoutFrame: TAutoLayoutFrame = {
  childIds: [],
  clipContent: true,
  fill: '#fff',
  height: 300,
  id: 'frame-1',
  layoutMode: LayoutMode.vertical,
  name: 'Frame',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 300,
  x: 0,
  y: 0,
};

const draggedRect: TSceneNode = {
  fill: '#000',
  height: 20,
  id: 'dragged',
  name: 'Rectangle',
  parentId: null,
  rotation: 0,
  type: NodeType.rectangle,
  width: 20,
  x: 500,
  y: 500,
} as TSceneNode;

describe('armAutoLayoutDropTarget', () => {
  it('should arm the reorder preview, not the drop indicator, when the drop stays inside the node’s current parent', () => {
    // mock
    const refs = createCanvasRefs();

    // action
    armAutoLayoutDropTarget(refs, autoLayoutFrame, 'frame-1', 'frame-1', [draggedRect], ['dragged'], {}, { x: 10, y: 10 });

    // result
    expect(refs.transform.autoLayoutReorderPreviewRef.current).not.toBeNull();
    expect(refs.transform.autoLayoutDropTargetRef.current).toBeNull();
  });

  it('should set the drop indicator, not the reorder preview, when dropping into a different parent', () => {
    // mock
    const refs = createCanvasRefs();

    // action
    armAutoLayoutDropTarget(refs, autoLayoutFrame, 'frame-1', null, [draggedRect], ['dragged'], {}, { x: 10, y: 10 });

    // result
    expect(refs.transform.autoLayoutDropTargetRef.current).toMatchObject({ frameId: 'frame-1' });
    expect(refs.transform.autoLayoutReorderPreviewRef.current).toBeNull();
  });
});
