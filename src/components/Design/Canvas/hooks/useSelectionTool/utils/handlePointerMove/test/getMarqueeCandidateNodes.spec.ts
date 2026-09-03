// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { getMarqueeCandidateNodes } from '../getMarqueeCandidateNodes';

const rect = (id: string, parentId: string | null = null): TSceneNode =>
  ({
    fill: '#000',
    height: 10,
    id,
    name: 'Rectangle',
    parentId,
    rotation: 0,
    type: NodeType.rectangle,
    width: 10,
    x: 0,
    y: 0,
  }) as TSceneNode;

const frame = (id: string, childIds: string[], parentId: string | null = null): TSceneNode =>
  ({
    childIds,
    clipContent: true,
    fill: '#fff',
    height: 100,
    id,
    name: 'Frame',
    parentId,
    rotation: 0,
    type: NodeType.frame,
    width: 100,
    x: 0,
    y: 0,
  }) as TSceneNode;

const group = (id: string, childIds: string[]): TSceneNode =>
  ({ childIds, height: 100, id, name: 'Group', parentId: null, rotation: 0, type: NodeType.group, width: 100, x: 0, y: 0 }) as TSceneNode;

describe('getMarqueeCandidateNodes', () => {
  it('should return the top-level nodes as-is when none of them are frames with children', () => {
    const nodesById = { a: rect('a'), b: rect('b') };

    expect(getMarqueeCandidateNodes(['a', 'b'], nodesById).map((node) => node.id)).toEqual(['a', 'b']);
  });

  it('should descend into a frame that has children, listing the frame then its children', () => {
    const nodesById = { child1: rect('child1', 'frame'), child2: rect('child2', 'frame'), frame: frame('frame', ['child1', 'child2']) };

    expect(getMarqueeCandidateNodes(['frame'], nodesById).map((node) => node.id)).toEqual(['frame', 'child1', 'child2']);
  });

  it('should descend recursively through nested frames with children', () => {
    const nodesById = {
      inner: frame('inner', ['leaf'], 'outer'),
      leaf: rect('leaf', 'inner'),
      outer: frame('outer', ['inner']),
    };

    expect(getMarqueeCandidateNodes(['outer'], nodesById).map((node) => node.id)).toEqual(['outer', 'inner', 'leaf']);
  });

  it('should not descend into a group, keeping its children out of the marquee', () => {
    const nodesById = { a: rect('a', 'g'), b: rect('b', 'g'), g: group('g', ['a', 'b']) };

    expect(getMarqueeCandidateNodes(['g'], nodesById).map((node) => node.id)).toEqual(['g']);
  });

  it('should skip an id that has no node', () => {
    expect(getMarqueeCandidateNodes(['missing'], {})).toEqual([]);
  });
});
