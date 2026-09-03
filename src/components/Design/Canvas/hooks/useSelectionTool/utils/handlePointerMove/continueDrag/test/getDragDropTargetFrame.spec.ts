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
  childIds: string[] = [],
  parentId: string | null = null,
): TSceneNode =>
  ({
    childIds,
    clipContent: true,
    fill: '#fff',
    height,
    id,
    name: 'Frame',
    parentId,
    rotation: 0,
    type: NodeType.frame,
    width,
    x,
    y,
  }) as TSceneNode;

const section = (id: string, x: number, y: number): TSceneNode =>
  ({ fill: '#000', height: 50, id, name: 'Section', parentId: null, rotation: 0, type: NodeType.section, width: 50, x, y }) as TSceneNode;

describe('getDragDropTargetFrame', () => {
  it('should return the frame the dragged selection lands inside, after applying the delta', () => {
    const draggedNode = rect('a', 0, 0);
    const targetFrame = frame('f1', 100, 0, 200, 200);
    const nodesById = { a: draggedNode, f1: targetFrame };

    // dragged from (0,0) by (150,50) lands its centre (25+150,25+50)=(175,75), inside f1
    const result = getDragDropTargetFrame([draggedNode], 150, 50, [draggedNode, targetFrame], nodesById);

    expect(result).toBe('f1');
  });

  it('should return null when the delta lands outside any frame', () => {
    const draggedNode = rect('a', 0, 0);
    const targetFrame = frame('f1', 1000, 1000, 200, 200);
    const nodesById = { a: draggedNode, f1: targetFrame };

    const result = getDragDropTargetFrame([draggedNode], 0, 0, [draggedNode, targetFrame], nodesById);

    expect(result).toBeNull();
  });

  it('should reject a frame that is itself part of the dragged selection', () => {
    const draggedFrame = frame('f1', 100, 0, 200, 200);
    const nodesById = { f1: draggedFrame };

    const result = getDragDropTargetFrame([draggedFrame], 0, 0, [draggedFrame], nodesById);

    expect(result).toBeNull();
  });

  it('should reject a frame that is a descendant of the dragged selection', () => {
    const outerFrame = frame('outer', 0, 0, 500, 500, ['inner']);
    const innerFrame = frame('inner', 100, 100, 200, 200, [], 'outer');
    const nodesById = { inner: innerFrame, outer: outerFrame };

    // dragging the outer frame so its centre lands over its own nested inner frame
    const result = getDragDropTargetFrame([outerFrame], 100, 100, [outerFrame, innerFrame], nodesById);

    expect(result).toBeNull();
  });

  it('should reject any drop when the dragged selection includes a section', () => {
    const draggedSection = section('s1', 0, 0);
    const targetFrame = frame('f1', 0, 0, 200, 200);
    const nodesById = { f1: targetFrame, s1: draggedSection };

    const result = getDragDropTargetFrame([draggedSection], 0, 0, [draggedSection, targetFrame], nodesById);

    expect(result).toBeNull();
  });
});
