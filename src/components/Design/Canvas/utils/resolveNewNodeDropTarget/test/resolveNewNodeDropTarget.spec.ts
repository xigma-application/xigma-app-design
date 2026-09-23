// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';
import { resolveNewNodeDropTarget } from '../resolveNewNodeDropTarget';

const freeformFrame = {
  childIds: ['existing'],
  clipContent: true,
  fills: [],
  height: 400,
  id: 'freeform-1',
  name: 'Frame',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 400,
  x: 0,
  y: 0,
} as TSceneNode;

const horizontalFrame = {
  childIds: [],
  clipContent: true,
  fills: [],
  height: 100,
  id: 'row-1',
  layoutMode: LayoutMode.horizontal,
  name: 'Frame',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 300,
  x: 2000,
  y: 0,
} as TSceneNode;

const verticalFrame = {
  childIds: [],
  clipContent: true,
  fills: [],
  height: 300,
  id: 'column-1',
  layoutMode: LayoutMode.vertical,
  name: 'Frame',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 100,
  x: 3000,
  y: 0,
} as TSceneNode;

const gridFrame = {
  childIds: [],
  clipContent: true,
  fills: [],
  gridAutoPlacement: true,
  gridColumnCount: 2,
  height: 200,
  id: 'grid-1',
  layoutMode: LayoutMode.grid,
  name: 'Frame',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 200,
  x: 1000,
  y: 0,
} as TSceneNode;

describe('resolveNewNodeDropTarget', () => {
  it('should return the root as the target when no frame is under the point', () => {
    // mock
    const canvasRefs = createCanvasRefs();

    canvasRefs.transform.dropTargetFrameIdRef.current = 'stale';

    // before
    const result = resolveNewNodeDropTarget(canvasRefs, { x: 5000, y: 5000 }, [freeformFrame, gridFrame], {}, ['a', 'b']);

    // result
    expect(result).toEqual({ parentId: null, targetIndex: 2 });
    expect(canvasRefs.transform.dropTargetFrameIdRef.current).toBeNull();
  });

  it('should resolve a freeform frame target and arm its outline', () => {
    // mock
    const canvasRefs = createCanvasRefs();
    const nodesById = { 'freeform-1': freeformFrame };

    // before
    const result = resolveNewNodeDropTarget(canvasRefs, { x: 100, y: 100 }, [freeformFrame], nodesById, []);

    // result
    expect(result).toEqual({ parentId: 'freeform-1', targetIndex: 1 });
    expect(canvasRefs.transform.dropTargetFrameIdRef.current).toBe('freeform-1');
  });

  it('should resolve a horizontal auto-layout frame target through the auto-layout resolver', () => {
    // mock
    const canvasRefs = createCanvasRefs();
    const nodesById = { 'row-1': horizontalFrame };

    // before — an empty frame, so the new node always lands at index 0
    const result = resolveNewNodeDropTarget(canvasRefs, { x: 2050, y: 50 }, [horizontalFrame], nodesById, []);

    // result
    expect(result).toEqual({ parentId: 'row-1', targetIndex: 0 });
    expect(canvasRefs.transform.dropTargetFrameIdRef.current).toBe('row-1');
  });

  it('should resolve a vertical auto-layout frame target through the auto-layout resolver', () => {
    // mock
    const canvasRefs = createCanvasRefs();
    const nodesById = { 'column-1': verticalFrame };

    // before — an empty frame, so the new node always lands at index 0
    const result = resolveNewNodeDropTarget(canvasRefs, { x: 3050, y: 50 }, [verticalFrame], nodesById, []);

    // result
    expect(result).toEqual({ parentId: 'column-1', targetIndex: 0 });
    expect(canvasRefs.transform.dropTargetFrameIdRef.current).toBe('column-1');
  });

  it('should resolve a grid frame target through the grid cell resolver', () => {
    // mock
    const canvasRefs = createCanvasRefs();
    const nodesById = { 'grid-1': gridFrame };

    // before — 1050 is 50px into the grid frame's first cell
    const result = resolveNewNodeDropTarget(canvasRefs, { x: 1050, y: 50 }, [gridFrame], nodesById, []);

    // result
    expect(result).toEqual({ parentId: 'grid-1', targetIndex: 0 });
    expect(canvasRefs.transform.dropTargetFrameIdRef.current).toBe('grid-1');
  });
});
