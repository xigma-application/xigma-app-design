// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { createCanvasRefs } from '../../../../useCanvasRefs/createCanvasRefs';
import { getVisibleHoveredNode } from '../getVisibleHoveredNode';

const buildFrame = (id: string): TSceneNode =>
  ({
    fill: '#ff0000',
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

describe('getVisibleHoveredNode', () => {
  it('should return null when nothing is hovered', () => {
    // before
    const result = getVisibleHoveredNode({}, null, null, createCanvasRefs());

    // result
    expect(result).toBeNull();
  });

  it('should return the hovered node when it exists and isn’t being edited or transformed', () => {
    // mock
    const node = buildFrame('a');

    // before
    const result = getVisibleHoveredNode({ a: node }, 'a', null, createCanvasRefs());

    // result
    expect(result).toBe(node);
  });

  it('should return null when the hovered node is the one currently open for editing', () => {
    // mock
    const node = buildFrame('a');

    // before
    const result = getVisibleHoveredNode({ a: node }, 'a', 'a', createCanvasRefs());

    // result
    expect(result).toBeNull();
  });

  it('should return null when the hovered node is currently mid-transform (drag/resize/rotate snapshot in progress)', () => {
    // mock
    const node = buildFrame('a');
    const refs = createCanvasRefs();

    refs.transform.resizedNodeIdsRef.current = new Set(['a']);

    // before
    const result = getVisibleHoveredNode({ a: node }, 'a', null, refs);

    // result
    expect(result).toBeNull();
  });
});
