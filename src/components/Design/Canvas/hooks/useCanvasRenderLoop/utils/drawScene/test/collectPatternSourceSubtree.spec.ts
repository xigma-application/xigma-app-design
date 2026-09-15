// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { collectPatternSourceSubtree } from '../collectPatternSourceSubtree';

const frame = (id: string, childIds: string[]): TSceneNode =>
  ({
    childIds,
    clipContent: false,
    fills: [],
    height: 10,
    id,
    name: id,
    parentId: null,
    rotation: 0,
    type: NodeType.frame,
    width: 10,
    x: 0,
    y: 0,
  }) as TSceneNode;

const rect = (id: string): TSceneNode =>
  ({
    fills: [],
    height: 10,
    id,
    name: id,
    parentId: null,
    rotation: 0,
    type: NodeType.rectangle,
    width: 10,
    x: 0,
    y: 0,
  }) as TSceneNode;

describe('collectPatternSourceSubtree', () => {
  it('should return just the node itself when it has no children', () => {
    // mock
    const node = rect('r1');

    // before
    const subtree = collectPatternSourceSubtree('r1', { r1: node });

    // result
    expect(subtree).toEqual([node]);
  });

  it('should return an empty array when the node does not exist', () => {
    // before
    const subtree = collectPatternSourceSubtree('missing', {});

    // result
    expect(subtree).toEqual([]);
  });

  it('should include every descendant, parent first then children in their own childIds order', () => {
    // mock
    const child1 = rect('c1');
    const child2 = rect('c2');
    const root = frame('f1', ['c1', 'c2']);
    const nodesById = { c1: child1, c2: child2, f1: root };

    // before
    const subtree = collectPatternSourceSubtree('f1', nodesById);

    // result
    expect(subtree).toEqual([root, child1, child2]);
  });

  it('should recurse through nested containers', () => {
    // mock
    const grandchild = rect('gc1');
    const child = frame('c1', ['gc1']);
    const root = frame('f1', ['c1']);
    const nodesById = { c1: child, f1: root, gc1: grandchild };

    // before
    const subtree = collectPatternSourceSubtree('f1', nodesById);

    // result
    expect(subtree).toEqual([root, child, grandchild]);
  });

  it('should skip a childId that no longer resolves to a node, without throwing', () => {
    // mock
    const root = frame('f1', ['missing-child']);

    // before / result
    expect(() => collectPatternSourceSubtree('f1', { f1: root })).not.toThrow();
    expect(collectPatternSourceSubtree('f1', { f1: root })).toEqual([root]);
  });
});
