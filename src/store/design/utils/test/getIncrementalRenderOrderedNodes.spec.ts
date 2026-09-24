// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { getIncrementalRenderOrderedNodes } from '../getIncrementalRenderOrderedNodes';

const rectangle = (id: string, x = 0): TSceneNode =>
  ({ height: 10, id, name: id, parentId: null, rotation: 0, type: NodeType.rectangle, width: 10, x, y: 0 }) as unknown as TSceneNode;

const frame = (id: string, childIds: string[]): TSceneNode =>
  ({
    childIds,
    clipContent: true,
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
  }) as unknown as TSceneNode;

describe('getIncrementalRenderOrderedNodes', () => {
  it('should list the roots and, after each container, its children in paint order', () => {
    // mock
    const nodes = { a: rectangle('a'), c: { ...rectangle('c'), parentId: 'f' } as TSceneNode, f: frame('f', ['c']) };

    // result
    expect(getIncrementalRenderOrderedNodes(['a', 'f'], nodes).map((node) => node.id)).toEqual(['a', 'f', 'c']);
  });

  it('should return the same list for the same inputs', () => {
    // mock
    const rootOrder = ['a'];
    const nodes = { a: rectangle('a') };

    // before
    const first = getIncrementalRenderOrderedNodes(rootOrder, nodes);

    // result
    expect(getIncrementalRenderOrderedNodes(rootOrder, nodes)).toBe(first);
  });

  it('should patch the replaced leaf into a copy of the previous list when the structure is unchanged', () => {
    // mock
    const rootOrder = ['a', 'b'];
    const a = rectangle('a');
    const first = { a, b: rectangle('b', 0) };
    const second = { a, b: rectangle('b', 7) };
    const third = { a, b: rectangle('b', 9) };

    // before
    const firstList = getIncrementalRenderOrderedNodes(rootOrder, first);
    const secondList = getIncrementalRenderOrderedNodes(rootOrder, second);
    const thirdList = getIncrementalRenderOrderedNodes(rootOrder, third);

    // result
    expect(secondList).not.toBe(firstList);
    expect(secondList).toEqual([a, second.b]);
    expect(thirdList).toEqual([a, third.b]);
  });

  it('should skip a changed node that is not part of the render order', () => {
    // mock
    const rootOrder = ['a'];
    const a = rectangle('a');
    const first = { a, orphan: rectangle('orphan', 0) };
    const second = { a, orphan: rectangle('orphan', 4) };

    // before
    getIncrementalRenderOrderedNodes(rootOrder, first);

    // result
    expect(getIncrementalRenderOrderedNodes(rootOrder, second)).toEqual([a]);
  });

  it.each([
    ['the root order changed', ['b', 'a'], undefined],
    ['a container changed', ['a', 'f'], 'container'],
    ['a node was added', ['a', 'z'], 'added'],
  ])('should rebuild the list when %s', (_, rootOrder, kind) => {
    // mock
    const a = rectangle('a');
    const f = frame('f', []);
    const first = { a, b: rectangle('b'), f };
    const second =
      kind === 'container' ? { a, b: first.b, f: frame('f', ['a']) } : kind === 'added' ? { a, b: first.b, f, z: rectangle('z') } : first;

    // before
    getIncrementalRenderOrderedNodes(['a', 'f'], first);

    // result
    expect(getIncrementalRenderOrderedNodes(rootOrder, second).length).toBeGreaterThan(0);
  });

  it('should rebuild the list when too many nodes changed', () => {
    // mock
    const ids = Array.from({ length: 100 }, (_, index) => `n${index}`);
    const many = (x: number): Record<string, TSceneNode> => Object.fromEntries(ids.map((id) => [id, rectangle(id, x)]));

    // before
    getIncrementalRenderOrderedNodes(ids, many(0));

    // result
    expect(getIncrementalRenderOrderedNodes(ids, many(1))).toHaveLength(100);
  });
});
