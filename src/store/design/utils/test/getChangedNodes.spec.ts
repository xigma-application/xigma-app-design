// types
import { TSceneNode } from 'types/design/types';

// utils
import { getChangedNodes } from '../getChangedNodes';

const createNode = (id: string, x = 0): TSceneNode => ({ height: 10, id, type: 'rectangle', width: 10, x, y: 0 }) as unknown as TSceneNode;

describe('getChangedNodes', () => {
  it('should list the old and new version of a replaced node and ignore untouched ones', () => {
    // mock
    const untouched = createNode('a');
    const before = createNode('b', 0);
    const after = createNode('b', 50);

    // before
    const result = getChangedNodes({ a: untouched, b: before }, { a: untouched, b: after });

    // result
    expect([...result.ids]).toEqual(['b']);
    expect(result.nodes).toEqual([after, before]);
    expect(result.all).toBe(false);
  });

  it('should list a node that was added and one that was removed', () => {
    // mock
    const added = createNode('new');
    const removed = createNode('old');

    // before
    const result = getChangedNodes({ old: removed }, { new: added });

    // result
    expect([...result.ids].sort()).toEqual(['new', 'old']);
    expect(result.nodes).toEqual([added, removed]);
  });

  it('should give up tracking when too many nodes changed', () => {
    // mock
    const from = Object.fromEntries(Array.from({ length: 70 }, (_, index) => [`n${index}`, createNode(`n${index}`)]));
    const to = Object.fromEntries(Array.from({ length: 70 }, (_, index) => [`n${index}`, createNode(`n${index}`, 5)]));

    // result
    expect(getChangedNodes(from, to).all).toBe(true);
  });

  it('should reuse the last comparison for the same pair of states', () => {
    // mock
    const from = { a: createNode('a') };
    const to = { a: createNode('a', 5) };

    // before
    const first = getChangedNodes(from, to);

    // result
    expect(getChangedNodes(from, to)).toBe(first);
    expect(getChangedNodes(to, from)).not.toBe(first);
  });

  it('should count added and removed nodes', () => {
    // mock
    const kept = createNode('kept');

    // before
    const result = getChangedNodes({ gone: createNode('gone'), kept }, { fresh: createNode('fresh'), kept });

    // result
    expect(result.added).toBe(1);
    expect(result.removed).toBe(1);
  });

  it('should report no additions or removals for a pure replacement', () => {
    // before
    const result = getChangedNodes({ a: createNode('a') }, { a: createNode('a', 3) });

    // result
    expect(result.added).toBe(0);
    expect(result.removed).toBe(0);
  });

  it('should stop early and report everything changed as soon as too many nodes differ', () => {
    // mock
    const from = Object.fromEntries(Array.from({ length: 200 }, (_, index) => [`n${index}`, createNode(`n${index}`)]));
    const to = Object.fromEntries(Array.from({ length: 200 }, (_, index) => [`n${index}`, createNode(`n${index}`, 1)]));

    // before
    const result = getChangedNodes(from, to);

    // result
    expect(result.all).toBe(true);
    expect(result.ids.size).toBe(65);
  });

  it('should report everything changed when removals alone exceed the tracking limit', () => {
    // mock
    const from = Object.fromEntries(Array.from({ length: 100 }, (_, index) => [`m${index}`, createNode(`m${index}`)]));

    // result
    expect(getChangedNodes(from, {}).all).toBe(true);
  });

  it('should reuse the counted size of a state it has already compared', () => {
    // mock
    const first = { a: createNode('a') };
    const second = { a: createNode('a', 1) };
    const third = { a: createNode('a', 2) };

    // before
    getChangedNodes(first, second);
    const result = getChangedNodes(second, third);

    // result
    expect(result.removed).toBe(0);
    expect(result.added).toBe(0);
  });
});
