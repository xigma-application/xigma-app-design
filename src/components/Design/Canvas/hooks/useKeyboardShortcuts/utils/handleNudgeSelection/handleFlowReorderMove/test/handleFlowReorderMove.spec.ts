// store
import { addNodes, deleteNode, updateNode } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { undo } from 'store/history/actions';
import { store } from 'store';

// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TFrameNode, TSceneNode } from 'types/design/types';

// utils
import { createCanvasRefs } from '../../../../../useCanvasRefs/createCanvasRefs';
import { handleFlowReorderMove } from '../handleFlowReorderMove';

let seq = 0;

const node = (id: string): any => selectActivePage(store.getState()).nodes[id];

type TFlowChildSpec = { height?: number; id: string; width?: number };

const setupFlowFrame = (
  layoutMode: LayoutMode.horizontal | LayoutMode.vertical,
  layoutWrap: boolean,
  frameSize: { height: number; width: number },
  children: TFlowChildSpec[],
): { frameId: string } => {
  seq += 1;

  const frameId = `flow-move-frame-${seq}`;

  store.dispatch(
    addNodes({
      nodes: [
        {
          childIds: children.map((child) => child.id),
          clipContent: true,
          fill: '#fff',
          height: frameSize.height,
          id: frameId,
          layoutMode,
          layoutWrap,
          name: 'Frame',
          parentId: null,
          rotation: 0,
          type: NodeType.frame,
          width: frameSize.width,
          x: 0,
          y: 0,
        },
        ...children.map((child) => ({
          fill: '#000',
          height: child.height ?? 20,
          id: child.id,
          name: 'Rectangle',
          parentId: frameId,
          rotation: 0,
          type: NodeType.rectangle,
          width: child.width ?? 20,
          x: 0,
          y: 0,
        })),
      ] as any,
      rootIds: [frameId],
    }),
  );

  return { frameId };
};

const move = (frameId: string, selectedIds: string[], deltaX: number, deltaY: number): void => {
  const nodesById = selectActivePage(store.getState()).nodes as unknown as Record<string, TSceneNode>;
  const frame = nodesById[frameId] as TFrameNode;
  const selectedNodes = selectedIds.map((id) => nodesById[id]);

  handleFlowReorderMove(store.dispatch, createCanvasRefs(), frame, selectedNodes, nodesById, deltaX, deltaY);
};

const childIds = (frameId: string): string[] => node(frameId).childIds;

describe('handleFlowReorderMove', () => {
  beforeEach(() => {
    selectActivePage(store.getState()).rootOrder.forEach((id) => store.dispatch(deleteNode(id)));
  });

  it('should swap a single item forward with its next flow-order neighbor on a primary-axis move', () => {
    // mock
    const { frameId } = setupFlowFrame(LayoutMode.horizontal, false, { height: 100, width: 200 }, [{ id: 'a' }, { id: 'b' }, { id: 'c' }]);

    // before
    move(frameId, ['a'], 1, 0);

    // result
    expect(childIds(frameId)).toEqual(['b', 'a', 'c']);
  });

  it('should be undoable as a single step', () => {
    // mock
    const { frameId } = setupFlowFrame(LayoutMode.horizontal, false, { height: 100, width: 200 }, [{ id: 'a' }, { id: 'b' }]);

    // before
    move(frameId, ['a'], 1, 0);
    store.dispatch(undo());

    // result
    expect(childIds(frameId)).toEqual(['a', 'b']);
  });

  it('should block a primary-axis move at the edge of the line', () => {
    // mock
    const { frameId } = setupFlowFrame(LayoutMode.horizontal, false, { height: 100, width: 200 }, [{ id: 'a' }, { id: 'b' }]);

    // before
    move(frameId, ['b'], 1, 0);

    // result
    expect(childIds(frameId)).toEqual(['a', 'b']);
  });

  it('should cross into the next row on a Down move, reflecting that the vacated row reabsorbs a trailing sibling', () => {
    // mock — two 100px-wide children per row, four total, wraps into two rows of two
    const { frameId } = setupFlowFrame(LayoutMode.horizontal, true, { height: 200, width: 200 }, [
      { id: 'a', width: 100 },
      { id: 'b', width: 100 },
      { id: 'c', width: 100 },
      { id: 'd', width: 100 },
    ]);

    // before — move 'a' (row 0) down. Once 'a' is excluded, 'b' + 'c' (200px) now fit together in
    // row 0, so 'c' gets pulled back — 'a' lands right after it, genuinely starting the next row
    move(frameId, ['a'], 0, 1);

    // result
    expect(childIds(frameId)).toEqual(['b', 'c', 'a', 'd']);
  });

  it('should evict row 0’s trailing item to make room for an Up cross move, when the row is exactly full (the bug reported live: "Up doesn’t work")', () => {
    // mock — two 100px-wide children per row, filling the 200px row exactly (zero slack)
    const { frameId } = setupFlowFrame(LayoutMode.horizontal, true, { height: 200, width: 200 }, [
      { id: 'a', width: 100 },
      { id: 'b', width: 100 },
      { id: 'c', width: 100 },
      { id: 'd', width: 100 },
    ]);

    // before — 'd' can't join row 0 as-is (already full at 200/200px), but evicting row 0's own
    // trailing item ('b', pushed forward to join what's left of row 1) makes room — mirroring how
    // Down already benefits from the vacated row reabsorbing a trailing sibling
    move(frameId, ['d'], 0, -1);

    // result — 'd' crosses into row 0 (now [a,d]); 'b' is pushed forward to join 'c' in row 1
    expect(childIds(frameId)).toEqual(['a', 'd', 'b', 'c']);
  });

  it('should move a child to become the last item of the previous row on an Up cross move, when that row genuinely has room without evicting anything', () => {
    // mock — row 0 = [a,b] (200/220px, 20px slack); row 1 = [c,d] ('c' 100px didn't fit in row 0,
    // but 'd' is only 15px — small enough to fit into row 0's remaining slack)
    const { frameId } = setupFlowFrame(LayoutMode.horizontal, true, { height: 200, width: 220 }, [
      { id: 'a', width: 100 },
      { id: 'b', width: 100 },
      { id: 'c', width: 100 },
      { id: 'd', width: 15 },
    ]);

    // before — move 'd' (row 1's last item) up: it genuinely fits, becoming the last item of row 0
    move(frameId, ['d'], 0, -1);

    // result
    expect(childIds(frameId)).toEqual(['a', 'b', 'd', 'c']);
  });

  it('should swap the block into the previous row at the SAME index it occupies in its own row, evicting the item at that position rather than the tail', () => {
    // mock — same row-0-has-slack setup as above, but this time move 'c' (row 1's FIRST item,
    // index 0) — it should trade places with row 0's item at index 0 ('a'), not its tail ('b'),
    // once evicting just 'a' is enough for 'b' + 'c' (200px) to fit within the 220px frame
    const { frameId } = setupFlowFrame(LayoutMode.horizontal, true, { height: 200, width: 220 }, [
      { id: 'a', width: 100 },
      { id: 'b', width: 100 },
      { id: 'c', width: 100 },
      { id: 'd', width: 15 },
    ]);

    move(frameId, ['c'], 0, -1);

    // result — 'c' takes 'a''s old spot in row 0 (now [c,b]); 'a' is pushed forward into row 1
    expect(childIds(frameId)).toEqual(['c', 'b', 'a', 'd']);
  });

  it('should block an Up cross move entirely when the child itself is wider than the whole row, even after evicting everything', () => {
    // mock — a 150px child can never fit inside a 100px-wide frame, no matter what's evicted
    const { frameId } = setupFlowFrame(LayoutMode.horizontal, true, { height: 200, width: 100 }, [
      { id: 'a', width: 50 },
      { id: 'b', width: 150 },
    ]);

    move(frameId, ['b'], 0, -1);

    // result — nothing moves
    expect(childIds(frameId)).toEqual(['a', 'b']);
  });

  it('should append at the very end when an Up cross move evicts the entire previous row and nothing else remains after the block', () => {
    // mock — only two children total: 'a' (row 0) and 'b' (row 1, too wide to join 'a' directly)
    const { frameId } = setupFlowFrame(LayoutMode.horizontal, true, { height: 200, width: 100 }, [
      { id: 'a', width: 80 },
      { id: 'b', width: 90 },
    ]);

    // before — 'b' doesn't fit next to 'a' (170 > 100), but fits alone once 'a' is fully evicted;
    // there's nothing left in the flow after evicting 'a' and moving 'b', so the block lands at
    // the very end of the raw childIds array instead of "before" some anchor sibling
    move(frameId, ['b'], 0, -1);

    // result — 'b' crosses into row 0 alone, 'a' is pushed after it
    expect(childIds(frameId)).toEqual(['b', 'a']);
  });

  it('should block an Up cross move on a child already in the first row — there is no previous row at all', () => {
    // mock
    const { frameId } = setupFlowFrame(LayoutMode.horizontal, true, { height: 200, width: 220 }, [
      { id: 'a', width: 100 },
      { id: 'b', width: 100 },
    ]);

    move(frameId, ['a'], 0, -1);

    // result — nothing moves
    expect(childIds(frameId)).toEqual(['a', 'b']);
  });

  it('should cross columns with the opposite key mapping for Vertical+Wrap', () => {
    // mock — two 100px-tall children per column, four total, wraps into two columns of two
    const { frameId } = setupFlowFrame(LayoutMode.vertical, true, { height: 200, width: 200 }, [
      { height: 100, id: 'a' },
      { height: 100, id: 'b' },
      { height: 100, id: 'c' },
      { height: 100, id: 'd' },
    ]);

    // before — Right (not Down) crosses columns for a vertical flow; 'a' crosses into column 1,
    // same reabsorption as the Horizontal+Down case above (mirrored to the other axis)
    move(frameId, ['a'], 1, 0);

    // result
    expect(childIds(frameId)).toEqual(['b', 'c', 'a', 'd']);
  });

  it('should block a cross move entirely when the frame has no wrap', () => {
    // mock
    const { frameId } = setupFlowFrame(LayoutMode.horizontal, false, { height: 200, width: 200 }, [
      { id: 'a', width: 100 },
      { id: 'b', width: 100 },
    ]);

    // before
    move(frameId, ['a'], 0, 1);

    // result
    expect(childIds(frameId)).toEqual(['a', 'b']);
  });

  it('should move a contiguous multi-selection across lines atomically, preserving relative order', () => {
    // mock
    const { frameId } = setupFlowFrame(LayoutMode.horizontal, true, { height: 200, width: 300 }, [
      { id: 'a', width: 100 },
      { id: 'b', width: 100 },
      { id: 'c', width: 100 },
      { id: 'd', width: 100 },
      { id: 'e', width: 100 },
    ]);

    // before — row 0 = [a,b,c], row 1 = [d,e]; move 'a' and 'b' down together. Once excluded,
    // 'c' + 'd' + 'e' (300px) all fit on one row together, so the whole trailing content
    // reabsorbs into a single row and 'a','b' land together as their own fresh row after it
    move(frameId, ['a', 'b'], 0, 1);

    // result — 'a' and 'b' keep their own relative order, appended after everything else
    expect(childIds(frameId)).toEqual(['c', 'd', 'e', 'a', 'b']);
  });

  it('should block the whole gesture when the multi-selection is not contiguous in flow order', () => {
    // mock
    const { frameId } = setupFlowFrame(LayoutMode.horizontal, false, { height: 100, width: 400 }, [{ id: 'a' }, { id: 'b' }, { id: 'c' }]);

    // before — 'b' sits unselected between 'a' and 'c'
    move(frameId, ['a', 'c'], 1, 0);

    // result — nothing moves
    expect(childIds(frameId)).toEqual(['a', 'b', 'c']);
  });

  it('should do nothing when a selected node is not actually part of the frame’s flow sequence', () => {
    // mock — 'floating' has ignoreAutoLayout set, so it never enters the flow reading order at all,
    // even though it's still passed into selectedNodes here (defensive: this path is normally
    // unreachable through the real gate, which already excludes ignoreAutoLayout nodes)
    const { frameId } = setupFlowFrame(LayoutMode.horizontal, false, { height: 100, width: 200 }, [{ id: 'a' }, { id: 'floating' }]);

    store.dispatch(updateNode({ changes: { ignoreAutoLayout: true }, id: 'floating' }));

    // before
    move(frameId, ['a', 'floating'], 1, 0);

    // result — no dispatch, childIds untouched
    expect(childIds(frameId)).toEqual(['a', 'floating']);
  });

  it('should do nothing when neither delta is set', () => {
    // mock
    const { frameId } = setupFlowFrame(LayoutMode.horizontal, false, { height: 100, width: 200 }, [{ id: 'a' }, { id: 'b' }]);

    // before & result — must not throw with no direction to move in
    expect(() => move(frameId, ['a'], 0, 0)).not.toThrow();
    expect(childIds(frameId)).toEqual(['a', 'b']);
  });
});
