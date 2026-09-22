// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { getTopLevelIds } from '../getTopLevelIds';

const rect = (id: string, parentId: string | null = null): TSceneNode =>
  ({
    fills: [],
    height: 20,
    id,
    name: id,
    parentId,
    rotation: 0,
    type: NodeType.rectangle,
    width: 20,
    x: 0,
    y: 0,
  }) as TSceneNode;

describe('getTopLevelIds', () => {
  it('should keep every id when none of them are ancestors of each other', () => {
    // mock
    const nodesById = { c1: rect('c1'), c2: rect('c2'), c3: rect('c3') };

    // action
    const result = getTopLevelIds(['c1', 'c2', 'c3'], nodesById);

    // result
    expect(result).toEqual(['c1', 'c2', 'c3']);
  });

  it('should drop a direct child whose parent is also in the given set', () => {
    // mock
    const nodesById = { c1: rect('c1', 'f1'), f1: rect('f1') };

    // action
    const result = getTopLevelIds(['f1', 'c1'], nodesById);

    // result
    expect(result).toEqual(['f1']);
  });

  it('should drop a grandchild whose ancestor several levels up is also in the given set', () => {
    // mock
    const nodesById = { c1: rect('c1', 'g1'), f1: rect('f1'), g1: rect('g1', 'f1') };

    // action
    const result = getTopLevelIds(['f1', 'c1'], nodesById);

    // result — g1 (the frame's direct child) is not itself in the set, but c1's ancestor chain
    // still passes through it up to f1, which is in the set
    expect(result).toEqual(['f1']);
  });

  it('should keep a child whose parent is not in the given set, even if some other unrelated id is', () => {
    // mock
    const nodesById = { c1: rect('c1', 'f1'), f1: rect('f1'), other: rect('other') };

    // action
    const result = getTopLevelIds(['c1', 'other'], nodesById);

    // result
    expect(result).toEqual(['c1', 'other']);
  });
});
