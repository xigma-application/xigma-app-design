// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { getDragDropTargetFrame } from '../getDragDropTargetFrame';

const rect = (id: string, x: number, y: number, width = 50, height = 50, parentId: string | null = null): TSceneNode =>
  ({ fill: '#000', height, id, name: 'Rectangle', parentId, rotation: 0, type: NodeType.rectangle, width, x, y }) as TSceneNode;

const frame = (
  id: string,
  x: number,
  y: number,
  width: number,
  height: number,
  { childIds = [], parentId = null, rotation = 0 }: { childIds?: string[]; parentId?: string | null; rotation?: number } = {},
): TSceneNode =>
  ({
    childIds,
    clipContent: true,
    fill: '#fff',
    height,
    id,
    name: 'Frame',
    parentId,
    rotation,
    type: NodeType.frame,
    width,
    x,
    y,
  }) as TSceneNode;

describe('getDragDropTargetFrame', () => {
  it('should return the frame under the pointer, anywhere inside its bounds', () => {
    const draggedNode = rect('a', 0, 0);
    const targetFrame = frame('f1', 100, 0, 200, 200);
    const nodesById = { a: draggedNode, f1: targetFrame };

    // pointer well inside f1's interior, nowhere near its outline
    const result = getDragDropTargetFrame(['a'], { x: 180, y: 90 }, [draggedNode, targetFrame], nodesById);

    expect(result).toBe('f1');
  });

  it('should return null when the pointer is over empty canvas', () => {
    const draggedNode = rect('a', 0, 0);
    const targetFrame = frame('f1', 1000, 1000, 200, 200);
    const nodesById = { a: draggedNode, f1: targetFrame };

    const result = getDragDropTargetFrame(['a'], { x: 10, y: 10 }, [draggedNode, targetFrame], nodesById);

    expect(result).toBeNull();
  });

  it('should return the deepest (front-most) frame when frames overlap under the pointer', () => {
    const draggedNode = rect('a', 0, 0);
    const outer = frame('outer', 0, 0, 500, 500);
    const inner = frame('inner', 100, 100, 200, 200, { parentId: 'outer' });
    const nodesById = { a: draggedNode, inner, outer };

    // inner is listed after outer in render order → front-most
    const result = getDragDropTargetFrame(['a'], { x: 150, y: 150 }, [draggedNode, outer, inner], nodesById);

    expect(result).toBe('inner');
  });

  it('should skip a frame in the moved set and fall through to the outer frame under the pointer', () => {
    const outer = frame('outer', 0, 0, 500, 500, { childIds: ['inner'] });
    const inner = frame('inner', 100, 100, 200, 200, { parentId: 'outer' });
    const nodesById = { inner, outer };

    // dragging `inner`, pointer still over its own body — should resolve to `outer`, not `inner`
    const result = getDragDropTargetFrame(['inner'], { x: 150, y: 150 }, [outer, inner], nodesById);

    expect(result).toBe('outer');
  });

  it('should skip a frame that is a descendant of a moved node', () => {
    const outer = frame('outer', 0, 0, 500, 500, { childIds: ['inner'] });
    const inner = frame('inner', 100, 100, 200, 200, { parentId: 'outer' });
    const nodesById = { inner, outer };

    // dragging `outer`, pointer over the nested `inner` — inner is a descendant, so no valid target
    const result = getDragDropTargetFrame(['outer'], { x: 150, y: 150 }, [outer, inner], nodesById);

    expect(result).toBeNull();
  });

  it('should return a rotated frame when the pointer falls inside its rotated bounds', () => {
    const draggedNode = rect('a', 0, 0);
    // a 200x100 frame rotated 90° around its center (100, 50) now spans y from -50 to 150
    const rotatedFrame = frame('f1', 0, 0, 200, 100, { rotation: 90 });
    const nodesById = { a: draggedNode, f1: rotatedFrame };

    // (100, 140) is outside the unrotated rect (y > 100) but inside the rotated one
    const result = getDragDropTargetFrame(['a'], { x: 100, y: 140 }, [draggedNode, rotatedFrame], nodesById);

    expect(result).toBe('f1');
  });

  it('should ignore a pointer inside a rotated frame’s unrotated bounds but outside its actual rotated shape', () => {
    const draggedNode = rect('a', 0, 0);
    const rotatedFrame = frame('f1', 0, 0, 200, 100, { rotation: 90 });
    const nodesById = { a: draggedNode, f1: rotatedFrame };

    // (10, 10) is inside the unrotated rect but rotates out of the actual shape
    const result = getDragDropTargetFrame(['a'], { x: 10, y: 10 }, [draggedNode, rotatedFrame], nodesById);

    expect(result).toBeNull();
  });
});
