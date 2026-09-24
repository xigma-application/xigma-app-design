// types
import { TSceneNode } from 'types/design/types';

// utils
import { getNodeValues } from '../getNodeValues';

describe('getNodeValues', () => {
  it('should list the nodes of the record', () => {
    // mock
    const node = { id: 'a' } as TSceneNode;

    // before
    const result = getNodeValues({ a: node });

    // result
    expect(result).toEqual([node]);
  });

  it('should return the very same array for the same record', () => {
    // mock
    const nodesById = { a: { id: 'a' } as TSceneNode };

    // before
    const first = getNodeValues(nodesById);

    // result
    expect(getNodeValues(nodesById)).toBe(first);
  });

  it('should patch the previous list in place order when only some nodes were replaced', () => {
    // mock
    const a = { id: 'a', x: 0 } as unknown as TSceneNode;
    const b = { id: 'b', x: 0 } as unknown as TSceneNode;
    const nextB = { id: 'b', x: 9 } as unknown as TSceneNode;
    const first = { a, b };
    const second = { a, b: nextB };
    const third = { a, b: { id: 'b', x: 10 } as unknown as TSceneNode };

    // before
    const firstValues = getNodeValues(first);
    const secondValues = getNodeValues(second);
    const thirdValues = getNodeValues(third);

    // result
    expect(secondValues).not.toBe(firstValues);
    expect(secondValues).toEqual([a, nextB]);
    expect(thirdValues).toEqual([a, third.b]);
  });

  it('should rebuild the list when a node was added or removed', () => {
    // mock
    const a = { id: 'a' } as unknown as TSceneNode;
    const c = { id: 'c' } as unknown as TSceneNode;

    // before
    getNodeValues({ a });

    // result
    expect(getNodeValues({ a, c })).toEqual([a, c]);
    expect(getNodeValues({ c })).toEqual([c]);
  });

  it('should rebuild the list when too many nodes changed', () => {
    // mock
    const many = (x: number): Record<string, TSceneNode> =>
      Object.fromEntries(Array.from({ length: 100 }, (_, index) => [`n${index}`, { id: `n${index}`, x } as unknown as TSceneNode]));

    // before
    getNodeValues(many(0));

    // result
    expect(getNodeValues(many(1))).toHaveLength(100);
  });

  it('should rebuild the list when a changed node is not indexed under its key', () => {
    // mock
    const first = { key: { id: 'other', x: 0 } as unknown as TSceneNode };
    const second = { key: { id: 'other', x: 1 } as unknown as TSceneNode };

    // before
    getNodeValues(first);

    // result
    expect(getNodeValues(second)).toEqual([second.key]);
  });
});
