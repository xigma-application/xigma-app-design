// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { createCanvasRefs } from '../../../../useCanvasRefs/createCanvasRefs';
import { getVisibleSelectedNodes } from '../getVisibleSelectedNodes';

const buildFrame = (id: string): TSceneNode =>
  ({
    fill: '#ff0000',
    height: 10,
    id,
    name: 'Frame',
    parentId: null,
    rotation: 0,
    childIds: [], clipContent: true, type: NodeType.frame,
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
});
