// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TAutoLayoutFrame } from '../../types';
import { TSceneNode } from 'types/design/types';

// utils
import { armAutoLayoutSingleLineDropTarget } from '../armAutoLayoutSingleLineDropTarget';
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';
import { getAutoLayoutDropTargetContext } from '../getAutoLayoutDropTargetContext';

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

describe('armAutoLayoutSingleLineDropTarget', () => {
  it('arms the reorder preview when the drop stays inside the node’s current parent', () => {
    // mock
    const refs = createCanvasRefs();
    const context = getAutoLayoutDropTargetContext(autoLayoutFrame, 'frame-1', 'frame-1', [draggedRect], ['dragged'], {});

    // action
    armAutoLayoutSingleLineDropTarget(refs, autoLayoutFrame, 'frame-1', [draggedRect], null, { x: 10, y: 10 }, context);

    // result
    expect(refs.transform.autoLayoutReorderPreviewRef.current).not.toBeNull();
    expect(refs.transform.autoLayoutDropTargetRef.current).toBeNull();
  });

  it('arms the drop indicator when dropping into a different parent', () => {
    // mock
    const refs = createCanvasRefs();
    const context = getAutoLayoutDropTargetContext(autoLayoutFrame, 'frame-1', null, [draggedRect], ['dragged'], {});

    // action
    armAutoLayoutSingleLineDropTarget(refs, autoLayoutFrame, 'frame-1', [draggedRect], null, { x: 10, y: 10 }, context);

    // result
    expect(refs.transform.autoLayoutDropTargetRef.current).toMatchObject({ frameId: 'frame-1' });
    expect(refs.transform.autoLayoutReorderPreviewRef.current).toBeNull();
  });
});
