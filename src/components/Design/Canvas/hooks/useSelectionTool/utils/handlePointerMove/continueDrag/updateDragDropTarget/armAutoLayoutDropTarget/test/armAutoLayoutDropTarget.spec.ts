// types
import { LayoutMode, NodeType, SizingMode } from 'types/design/enums';
import { TAutoLayoutFrame } from '../../types';
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
    armAutoLayoutDropTarget(refs, autoLayoutFrame, 'frame-1', 'frame-1', [draggedRect], ['dragged'], {}, { x: 10, y: 10 }, null);

    // result
    expect(refs.transform.autoLayoutReorderPreviewRef.current).not.toBeNull();
    expect(refs.transform.autoLayoutDropTargetRef.current).toBeNull();
  });

  it('should set the drop indicator, not the reorder preview, when dropping into a different parent', () => {
    // mock
    const refs = createCanvasRefs();

    // action
    armAutoLayoutDropTarget(refs, autoLayoutFrame, 'frame-1', null, [draggedRect], ['dragged'], {}, { x: 10, y: 10 }, null);

    // result
    expect(refs.transform.autoLayoutDropTargetRef.current).toMatchObject({ frameId: 'frame-1' });
    expect(refs.transform.autoLayoutReorderPreviewRef.current).toBeNull();
  });

  it('should use the frame’s own horizontalGap, not verticalGap, to space simulated siblings for a horizontal frame', () => {
    // mock
    const horizontalAutoLayoutFrame: TAutoLayoutFrame = { ...autoLayoutFrame, horizontalGap: 50, layoutMode: LayoutMode.horizontal };
    const refs = createCanvasRefs();

    // action
    armAutoLayoutDropTarget(refs, horizontalAutoLayoutFrame, 'frame-1', null, [draggedRect], ['dragged'], {}, { x: 10, y: 10 }, null);

    // result
    expect(refs.transform.autoLayoutDropTargetRef.current).toMatchObject({ frameId: 'frame-1' });
  });

  it('should route through the wrap-aware drop target computation for a horizontal frame with wrap enabled, hugging the left wall of the row the cursor is actually over', () => {
    // mock — three 100x100 siblings: 'a' and 'b' share row 1 (250-wide content box, 100+20+100
    // fits), 'c' wraps onto row 2 alone, flush under 'a' — the exact shape reported as broken
    const siblingA: TSceneNode = { ...draggedRect, height: 100, id: 'a', width: 100, x: 0, y: 0 } as TSceneNode;
    const siblingB: TSceneNode = { ...draggedRect, height: 100, id: 'b', width: 100, x: 120, y: 0 } as TSceneNode;
    const siblingC: TSceneNode = { ...draggedRect, height: 100, id: 'c', width: 100, x: 0, y: 120 } as TSceneNode;
    const wrappedAutoLayoutFrame: TAutoLayoutFrame = {
      ...autoLayoutFrame,
      childIds: ['a', 'b', 'c'],
      height: 400,
      horizontalGap: 20,
      layoutMode: LayoutMode.horizontal,
      layoutWrap: true,
      verticalGap: 20,
      width: 250,
    };
    const refs = createCanvasRefs();
    const nodesById = { a: siblingA, b: siblingB, c: siblingC };

    // action — cursor at 'c'’s own left edge, in row 2
    armAutoLayoutDropTarget(refs, wrappedAutoLayoutFrame, 'frame-1', null, [draggedRect], ['dragged'], nodesById, { x: 20, y: 150 }, null);

    // result — regression: the old flat (non-wrap-aware) index math compared the cursor only
    // against each sibling's own x threshold in childIds order; 'c' shares 'a'’s near-zero x (both
    // start their own row at x=0), so it resolved to index 0 and hugged the frame's own top-left
    // edge — landing in row 1, not row 2 where the cursor actually was
    expect(refs.transform.autoLayoutDropTargetRef.current).toMatchObject({ frameId: 'frame-1', index: 2, indicator: { x: 2, y: 122 } });
  });

  it('should not perturb 1 and 2 when reordering 3 slightly within its own (otherwise-empty) row', () => {
    // mock — same wrapped shape as above, but this time 'c' is the node being dragged WITHIN its
    // own parent ('c' is excluded from the sibling list because it's the moved node) — regression:
    // without threading originalIndex through to the wrap computation, 'c'’s own row collapses once
    // it's excluded, and the cursor (still visually over row 2) misresolves into row 1, dragging 'a'
    // and 'b' along with it even though they no longer fit
    const siblingA: TSceneNode = { ...draggedRect, height: 100, id: 'a', width: 100, x: 0, y: 0 } as TSceneNode;
    const siblingB: TSceneNode = { ...draggedRect, height: 100, id: 'b', width: 100, x: 120, y: 0 } as TSceneNode;
    const draggedC: TSceneNode = { ...draggedRect, height: 100, id: 'c', width: 100, x: 0, y: 120 } as TSceneNode;
    const wrappedAutoLayoutFrame: TAutoLayoutFrame = {
      ...autoLayoutFrame,
      childIds: ['a', 'b', 'c'],
      height: 400,
      horizontalGap: 20,
      layoutMode: LayoutMode.horizontal,
      layoutWrap: true,
      verticalGap: 20,
      width: 250,
    };
    const refs = createCanvasRefs();
    const nodesById = { a: siblingA, b: siblingB };

    // action — same parent on both sides, cursor at 'c'’s own left edge, still in row 2
    armAutoLayoutDropTarget(refs, wrappedAutoLayoutFrame, 'frame-1', 'frame-1', [draggedC], ['c'], nodesById, { x: 20, y: 150 }, null);

    // result — 'c' resolves back to index 2 (row 2), not row 1
    expect(refs.transform.autoLayoutReorderPreviewRef.current).toMatchObject({ activeIndex: 2, frameId: 'frame-1' });
  });

  it('should fall back to the non-wrap drop target computation when wrap is enabled but the frame hugs its primary axis', () => {
    // mock — hug on the primary axis disables wrap, mirroring computeAutoLayoutPositions's own
    // wrapEnabled condition
    const huggedWrapFrame: TAutoLayoutFrame = {
      ...autoLayoutFrame,
      horizontalGap: 10,
      layoutMode: LayoutMode.horizontal,
      layoutWrap: true,
      primaryAxisSizingMode: SizingMode.hug,
    };
    const refs = createCanvasRefs();

    // action
    armAutoLayoutDropTarget(refs, huggedWrapFrame, 'frame-1', null, [draggedRect], ['dragged'], {}, { x: 10, y: 10 }, null);

    // result
    expect(refs.transform.autoLayoutDropTargetRef.current).toMatchObject({ frameId: 'frame-1' });
  });

  describe('multi-node block reorder in a wrap frame', () => {
    // six 100x100 children, two per row: [a,b] / [c,d] / [e,f]
    const gridNode = (id: string, x: number, y: number): TSceneNode =>
      ({ ...draggedRect, height: 100, id, width: 100, x, y }) as TSceneNode;
    const gridNodes = {
      a: gridNode('a', 0, 0),
      b: gridNode('b', 100, 0),
      c: gridNode('c', 0, 100),
      d: gridNode('d', 100, 100),
      e: gridNode('e', 0, 200),
      f: gridNode('f', 100, 200),
    };
    const gridFrame: TAutoLayoutFrame = {
      ...autoLayoutFrame,
      childIds: ['a', 'b', 'c', 'd', 'e', 'f'],
      height: 600,
      layoutMode: LayoutMode.horizontal,
      layoutWrap: true,
      width: 200,
    };

    it('anchors the block by its first (childIds) member — grabbing it puts the whole block after row 3', () => {
      const refs = createCanvasRefs();

      // action — drag the {c,d} block, grabbed by 'c', cursor over 'e' (position 5)
      armAutoLayoutDropTarget(
        refs,
        gridFrame,
        'frame-1',
        'frame-1',
        [gridNodes.c, gridNodes.d],
        ['c', 'd'],
        gridNodes,
        { x: 50, y: 250 },
        'c',
      );

      // result — reading-order slot 4, grabbed index 0 → block inserted at index 4 of [a,b,e,f]
      expect(refs.transform.autoLayoutReorderPreviewRef.current).toMatchObject({ activeIndex: 4, frameId: 'frame-1' });
    });

    it('offsets the insertion by which block member was grabbed — grabbing the second member lands the block one slot earlier', () => {
      const refs = createCanvasRefs();

      // action — same drag, but grabbed by 'd' (block-local index 1)
      armAutoLayoutDropTarget(
        refs,
        gridFrame,
        'frame-1',
        'frame-1',
        [gridNodes.c, gridNodes.d],
        ['c', 'd'],
        gridNodes,
        { x: 50, y: 250 },
        'd',
      );

      // result — slot 4 − 1 = 3
      expect(refs.transform.autoLayoutReorderPreviewRef.current).toMatchObject({ activeIndex: 3, frameId: 'frame-1' });
    });

    it('treats an unknown / missing grabbed node as the block’s first member (offset 0)', () => {
      const refs = createCanvasRefs();

      // action — grabbedNodeId is null (e.g. drag started in the gap with nothing resolvable)
      armAutoLayoutDropTarget(
        refs,
        gridFrame,
        'frame-1',
        'frame-1',
        [gridNodes.c, gridNodes.d],
        ['c', 'd'],
        gridNodes,
        { x: 50, y: 250 },
        null,
      );

      // result — no offset, same as grabbing the first member
      expect(refs.transform.autoLayoutReorderPreviewRef.current).toMatchObject({ activeIndex: 4, frameId: 'frame-1' });
    });
  });
});
