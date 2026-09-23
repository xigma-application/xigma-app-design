// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TAutoLayoutFrame } from 'components/Design/Canvas/hooks/useSelectionTool/utils/handlePointerMove/continueDrag/updateDragDropTarget/types';
import { TSceneNode } from 'types/design/types';

// utils
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';
import { resolveAutoLayoutNewNodeTarget } from '../resolveAutoLayoutNewNodeTarget';

const child = (id: string, x: number): TSceneNode =>
  ({
    fills: [],
    height: 100,
    id,
    name: id,
    parentId: 'row-1',
    rotation: 0,
    type: NodeType.rectangle,
    width: 100,
    x,
    y: 0,
  }) as TSceneNode;

const frame: TAutoLayoutFrame = {
  childIds: ['c1', 'c2'],
  clipContent: true,
  fills: [],
  height: 100,
  horizontalGap: 0,
  id: 'row-1',
  layoutMode: LayoutMode.horizontal,
  name: 'Frame',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 300,
  x: 0,
  y: 0,
};

const nodesById = { c1: child('c1', 0), c2: child('c2', 100) };

describe('resolveAutoLayoutNewNodeTarget', () => {
  it('should insert before the first child when the cursor is left of it, and clear the grid preview', () => {
    // mock
    const canvasRefs = createCanvasRefs();

    canvasRefs.transform.gridDropTargetRef.current = { cells: [], frameId: 'stale' } as never;

    // before
    const result = resolveAutoLayoutNewNodeTarget(canvasRefs, frame, nodesById, { x: -50, y: 50 });

    // result
    expect(result).toEqual({ parentId: 'row-1', targetIndex: 0 });
    expect(canvasRefs.transform.gridDropTargetRef.current).toBeNull();
  });

  it('should insert after both children when the cursor is past the last one', () => {
    // mock
    const canvasRefs = createCanvasRefs();

    // before
    const result = resolveAutoLayoutNewNodeTarget(canvasRefs, frame, nodesById, { x: 500, y: 50 });

    // result
    expect(result).toEqual({ parentId: 'row-1', targetIndex: 2 });
  });

  it('should insert between the two children when the cursor is over the seam', () => {
    // mock
    const canvasRefs = createCanvasRefs();

    // before — cursor over c2, past its own midpoint threshold for c1 but before c2's
    const result = resolveAutoLayoutNewNodeTarget(canvasRefs, frame, nodesById, { x: 110, y: 50 });

    // result
    expect(result).toEqual({ parentId: 'row-1', targetIndex: 1 });
  });
});
