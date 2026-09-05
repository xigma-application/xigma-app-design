// types
import { AlignmentLayout, LayoutMode, NodeType } from 'types/design/enums';
import { TAutoLayoutFrame } from '../../types';
import { TSceneNode } from 'types/design/types';

// utils
import { armAutoLayoutMultiRowReorderPreview } from '../armAutoLayoutMultiRowReorderPreview';
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';

// six 100x100 children, two per row: [a,b] / [c,d] / [e,f]; dragging the {c,d} block
const gridNode = (id: string, x: number, y: number): TSceneNode =>
  ({
    fill: '#000',
    height: 100,
    id,
    name: 'Rectangle',
    parentId: 'frame-1',
    rotation: 0,
    type: NodeType.rectangle,
    width: 100,
    x,
    y,
  }) as TSceneNode;
const gridBounds = {
  a: { x: 0, y: 0 },
  b: { x: 100, y: 0 },
  c: { x: 0, y: 100 },
  d: { x: 100, y: 100 },
  e: { x: 0, y: 200 },
  f: { x: 100, y: 200 },
};
const gridNodes = {
  a: gridNode('a', gridBounds.a.x, gridBounds.a.y),
  b: gridNode('b', gridBounds.b.x, gridBounds.b.y),
  c: gridNode('c', gridBounds.c.x, gridBounds.c.y),
  d: gridNode('d', gridBounds.d.x, gridBounds.d.y),
  e: gridNode('e', gridBounds.e.x, gridBounds.e.y),
  f: gridNode('f', gridBounds.f.x, gridBounds.f.y),
};
const gridFrame: TAutoLayoutFrame = {
  childIds: ['a', 'b', 'c', 'd', 'e', 'f'],
  clipContent: true,
  fill: '#fff',
  height: 600,
  id: 'frame-1',
  layoutMode: LayoutMode.horizontal,
  layoutWrap: true,
  name: 'Frame',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 200,
  x: 0,
  y: 0,
};
const remainingSiblings = ['a', 'b', 'e', 'f'] as const;
const siblingEntries = remainingSiblings.map((id) => ({
  bounds: { height: 100, width: 100, x: gridBounds[id].x, y: gridBounds[id].y },
  sibling: gridNodes[id],
}));
const siblingSizes = remainingSiblings.map((id) => ({ height: 100, id, width: 100 }));
const draggedSizes = [
  { height: 100, id: '__dragged__', width: 100 },
  { height: 100, id: '__dragged__', width: 100 },
];
const NO_PADDING = { paddingBottom: 0, paddingLeft: 0, paddingRight: 0, paddingTop: 0 };

describe('armAutoLayoutMultiRowReorderPreview', () => {
  it('anchors the block by its first (childIds) member — grabbing it puts the whole block after row 3', () => {
    // mock
    const refs = createCanvasRefs();

    // action — grabbed by 'c' (block-local index 0), cursor over 'e' (reading-order slot 4)
    armAutoLayoutMultiRowReorderPreview(
      refs,
      gridFrame,
      'frame-1',
      gridNodes,
      siblingEntries,
      siblingSizes,
      0,
      0,
      AlignmentLayout.topLeft,
      NO_PADDING,
      draggedSizes,
      ['c', 'd'],
      'c',
      { x: 50, y: 250 },
    );

    // result
    expect(refs.transform.autoLayoutReorderPreviewRef.current).toMatchObject({ activeIndex: 4, frameId: 'frame-1' });
  });

  it('offsets the insertion by which block member was grabbed — grabbing the second member lands the block one slot earlier', () => {
    // mock
    const refs = createCanvasRefs();

    // action — grabbed by 'd' (block-local index 1)
    armAutoLayoutMultiRowReorderPreview(
      refs,
      gridFrame,
      'frame-1',
      gridNodes,
      siblingEntries,
      siblingSizes,
      0,
      0,
      AlignmentLayout.topLeft,
      NO_PADDING,
      draggedSizes,
      ['c', 'd'],
      'd',
      { x: 50, y: 250 },
    );

    // result — slot 4 − 1 = 3
    expect(refs.transform.autoLayoutReorderPreviewRef.current).toMatchObject({ activeIndex: 3, frameId: 'frame-1' });
  });

  it('treats an unknown / missing grabbed node as the block’s first member (offset 0)', () => {
    // mock
    const refs = createCanvasRefs();

    // action — grabbedNodeId is null (e.g. drag started in the gap with nothing resolvable)
    armAutoLayoutMultiRowReorderPreview(
      refs,
      gridFrame,
      'frame-1',
      gridNodes,
      siblingEntries,
      siblingSizes,
      0,
      0,
      AlignmentLayout.topLeft,
      NO_PADDING,
      draggedSizes,
      ['c', 'd'],
      null,
      { x: 50, y: 250 },
    );

    // result — no offset, same as grabbing the first member
    expect(refs.transform.autoLayoutReorderPreviewRef.current).toMatchObject({ activeIndex: 4, frameId: 'frame-1' });
  });

  it('zeroes out the drop indicator, since a multi-row block reorder has no single insertion line to show', () => {
    // mock
    const refs = createCanvasRefs();

    // action
    armAutoLayoutMultiRowReorderPreview(
      refs,
      gridFrame,
      'frame-1',
      gridNodes,
      siblingEntries,
      siblingSizes,
      0,
      0,
      AlignmentLayout.topLeft,
      NO_PADDING,
      draggedSizes,
      ['c', 'd'],
      'c',
      { x: 50, y: 250 },
    );

    // result
    expect(refs.transform.autoLayoutDropTargetRef.current).toBeNull();
  });
});
