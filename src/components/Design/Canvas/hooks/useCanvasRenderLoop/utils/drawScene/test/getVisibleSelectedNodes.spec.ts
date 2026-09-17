// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { createCanvasRefs } from '../../../../useCanvasRefs/createCanvasRefs';
import { getVisibleSelectedNodes } from '../getVisibleSelectedNodes';

const buildFrame = (id: string): TSceneNode =>
  ({
    childIds: [],
    clipContent: true,
    fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
    height: 10,
    id,
    name: 'Frame',
    parentId: null,
    rotation: 0,
    type: NodeType.frame,
    width: 10,
    x: 0,
    y: 0,
  }) as TSceneNode;

describe('getVisibleSelectedNodes', () => {
  it('should return every selected node when nothing is being edited or transformed', () => {
    // mock
    const nodeA = buildFrame('a');
    const nodeB = buildFrame('b');

    // before
    const result = getVisibleSelectedNodes([nodeA, nodeB], null, createCanvasRefs());

    // result
    expect(result).toEqual([nodeA, nodeB]);
  });

  it('should exclude the node currently open for editing', () => {
    // mock
    const nodeA = buildFrame('a');
    const nodeB = buildFrame('b');

    // before
    const result = getVisibleSelectedNodes([nodeA, nodeB], 'a', createCanvasRefs());

    // result
    expect(result).toEqual([nodeB]);
  });

  it('should exclude a node currently mid-transform (drag/resize/rotate snapshot in progress)', () => {
    // mock
    const nodeA = buildFrame('a');
    const nodeB = buildFrame('b');
    const refs = createCanvasRefs();

    refs.transform.rotatedNodeIdsRef.current = new Set(['a']);

    // before
    const result = getVisibleSelectedNodes([nodeA, nodeB], null, refs);

    // result
    expect(result).toEqual([nodeB]);
  });

  it("should keep showing the frame's own outline while it's being plain-dragged, when its image editor is active in crop mode (regression: the frame's dashed outline and L-handles vanished mid-drag, same as any other transforming node)", () => {
    // mock
    const nodeA = buildFrame('a');
    const nodeB = buildFrame('b');
    const refs = createCanvasRefs();

    refs.transform.draggedNodeIdsRef.current = new Set(['a']);

    // before
    const result = getVisibleSelectedNodes([nodeA, nodeB], null, refs, { mode: 'crop', nodeId: 'a', paintIndex: 0 });

    // result
    expect(result).toEqual([nodeA, nodeB]);
  });

  it('should still hide the dragged node normally when the image editor is not in crop mode for it', () => {
    // mock
    const nodeA = buildFrame('a');
    const nodeB = buildFrame('b');
    const refs = createCanvasRefs();

    refs.transform.draggedNodeIdsRef.current = new Set(['a']);

    // before
    const result = getVisibleSelectedNodes([nodeA, nodeB], null, refs, { mode: 'position', nodeId: 'a', paintIndex: 0 });

    // result
    expect(result).toEqual([nodeB]);
  });
});
