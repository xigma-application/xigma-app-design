// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { getEligibleDraggedEntries } from '../getEligibleDraggedEntries';

const rect = (id: string): TSceneNode =>
  ({
    fill: '#000',
    height: 100,
    id,
    name: 'Rectangle',
    parentId: null,
    rotation: 0,
    type: NodeType.rectangle,
    width: 100,
    x: 0,
    y: 0,
  }) as TSceneNode;

const line = (id: string): TSceneNode =>
  ({ id, name: 'Line', parentId: null, stroke: '#000', type: NodeType.line, x1: 0, x2: 10, y1: 0, y2: 0 }) as TSceneNode;

describe('getEligibleDraggedEntries', () => {
  it('should include an eligible node with a plain {x,y} origin', () => {
    // action
    const entries = getEligibleDraggedEntries({ a: rect('a') }, { a: { x: 5, y: 7 } }, ['a']);

    // result
    expect(entries).toEqual([{ node: rect('a'), origin: { x: 5, y: 7 } }]);
  });

  it('should exclude an origin that is not the plain {x,y} shape, such as a line endpoint pair', () => {
    // action
    const entries = getEligibleDraggedEntries({ a: line('a') }, { a: { x1: 0, x2: 10, y1: 0, y2: 0 } }, ['a']);

    // result
    expect(entries).toEqual([]);
  });

  it('should exclude a node whose type is not snap-eligible, such as a frame', () => {
    // mock
    const nodes = { a: { ...rect('a'), type: NodeType.frame } as TSceneNode };

    // action
    const entries = getEligibleDraggedEntries(nodes, { a: { x: 0, y: 0 } }, ['a']);

    // result
    expect(entries).toEqual([]);
  });

  it('should exclude a dragged id that no longer resolves to any node', () => {
    // action
    const entries = getEligibleDraggedEntries({}, { a: { x: 0, y: 0 } }, ['a']);

    // result
    expect(entries).toEqual([]);
  });

  it('should keep only the eligible entries out of a mixed set of dragged ids', () => {
    // mock
    const nodes = { a: rect('a'), b: line('b') };

    // action
    const entries = getEligibleDraggedEntries(nodes, { a: { x: 0, y: 0 }, b: { x1: 0, x2: 10, y1: 0, y2: 0 } }, ['a', 'b']);

    // result
    expect(entries).toEqual([{ node: rect('a'), origin: { x: 0, y: 0 } }]);
  });
});
