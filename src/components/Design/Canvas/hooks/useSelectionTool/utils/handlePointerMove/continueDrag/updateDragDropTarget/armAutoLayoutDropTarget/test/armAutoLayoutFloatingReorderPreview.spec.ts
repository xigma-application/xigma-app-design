// types
import { LayoutMode, NodeType, SizingMode } from 'types/design/enums';
import { TAutoLayoutFrame } from '../../types';
import { TSceneNode } from 'types/design/types';

// utils
import { armAutoLayoutFloatingReorderPreview } from '../armAutoLayoutFloatingReorderPreview';
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';
import { getAutoLayoutDropTargetContext } from '../getAutoLayoutDropTargetContext';

const node = (id: string, x: number, y: number): TSceneNode =>
  ({
    fill: '#000',
    height: 20,
    id,
    name: 'Rectangle',
    parentId: 'frame-1',
    rotation: 0,
    type: NodeType.rectangle,
    width: 20,
    x,
    y,
  }) as TSceneNode;

const nodesById = { a: node('a', 0, 0), b: node('b', 0, 20), dragged: node('dragged', 0, 40) };

const autoLayoutFrame: TAutoLayoutFrame = {
  childIds: ['a', 'b', 'dragged'],
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

describe('armAutoLayoutFloatingReorderPreview', () => {
  it('arms the drop indicator and a slot-less preview whose siblings close the vacated gap', () => {
    // mock — a same-parent drag with the reorder suppressed (modifier held)
    const refs = createCanvasRefs();
    const context = getAutoLayoutDropTargetContext(
      autoLayoutFrame,
      'frame-1',
      'frame-1',
      [nodesById.dragged],
      ['dragged'],
      nodesById,
      true,
    );

    // action
    armAutoLayoutFloatingReorderPreview(refs, autoLayoutFrame, 'frame-1', [nodesById.dragged], { x: 10, y: 10 }, context);

    // result — indicator armed; preview has no reorder-ghost slots; the two siblings pack from the
    // frame's own top-left with no gap left for the dragged node
    expect(refs.transform.autoLayoutDropTargetRef.current).toMatchObject({ frameId: 'frame-1' });
    expect(refs.transform.autoLayoutReorderPreviewRef.current?.draggedMemberSlots).toBeUndefined();
    expect(refs.transform.autoLayoutReorderPreviewRef.current?.frameId).toBe('frame-1');
    expect(typeof refs.transform.autoLayoutReorderPreviewRef.current?.activeIndex).toBe('number');
    expect(refs.transform.autoLayoutReorderPreviewRef.current?.positions).toEqual({ a: { x: 0, y: 0 }, b: { x: 0, y: 20 } });
  });

  it('packs the siblings through the wrapped layout when the frame has wrap enabled', () => {
    // mock
    const refs = createCanvasRefs();
    const wrapFrame: TAutoLayoutFrame = {
      ...autoLayoutFrame,
      layoutMode: LayoutMode.horizontal,
      layoutWrap: true,
      primaryAxisSizingMode: SizingMode.fixed,
    };
    const context = getAutoLayoutDropTargetContext(wrapFrame, 'frame-1', 'frame-1', [nodesById.dragged], ['dragged'], nodesById, true);

    // action
    armAutoLayoutFloatingReorderPreview(refs, wrapFrame, 'frame-1', [nodesById.dragged], { x: 10, y: 10 }, context);

    // result — the wrapped packer still lays the two siblings out flush from the content-box origin
    expect(context.isWrapEnabled).toBe(true);
    expect(refs.transform.autoLayoutReorderPreviewRef.current?.positions).toEqual({ a: { x: 0, y: 0 }, b: { x: 20, y: 0 } });
    expect(refs.transform.autoLayoutReorderPreviewRef.current?.draggedMemberSlots).toBeUndefined();
  });
});
