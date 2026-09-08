// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { collectNudgeSubtreeNodes } from '../collectNudgeSubtreeNodes';

const group = (id: string, childIds: string[]): TSceneNode =>
  ({
    childIds,
    height: 10,
    id,
    name: 'Group',
    parentId: null,
    rotation: 0,
    type: NodeType.group,
    width: 10,
    x: 0,
    y: 0,
  }) as unknown as TSceneNode;

const rect = (id: string, parentId: string | null): TSceneNode =>
  ({ height: 10, id, name: 'Rectangle', parentId, rotation: 0, type: NodeType.rectangle, width: 10, x: 0, y: 0 }) as unknown as TSceneNode;

describe('collectNudgeSubtreeNodes', () => {
  it('should return a leaf node unchanged', () => {
    const nodes = { r1: rect('r1', null) };

    expect(collectNudgeSubtreeNodes([nodes.r1], nodes).map((node) => node.id)).toEqual(['r1']);
  });

  it('should expand a group to itself plus every descendant', () => {
    const nodes = {
      g1: group('g1', ['g2', 'r1']),
      g2: group('g2', ['r2']),
      r1: rect('r1', 'g1'),
      r2: rect('r2', 'g2'),
    };

    expect(
      collectNudgeSubtreeNodes([nodes.g1], nodes)
        .map((node) => node.id)
        .sort(),
    ).toEqual(['g1', 'g2', 'r1', 'r2']);
  });

  it('should de-duplicate when roots overlap (a group and one of its own children)', () => {
    const nodes = { g1: group('g1', ['r1']), r1: rect('r1', 'g1') };

    expect(
      collectNudgeSubtreeNodes([nodes.g1, nodes.r1], nodes)
        .map((node) => node.id)
        .sort(),
    ).toEqual(['g1', 'r1']);
  });
});
