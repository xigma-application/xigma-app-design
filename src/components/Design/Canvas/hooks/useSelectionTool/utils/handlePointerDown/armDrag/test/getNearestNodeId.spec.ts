// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { getNearestNodeId } from '../getNearestNodeId';

const box = (id: string, x: number, y: number): TSceneNode =>
  ({
    fill: '#000',
    height: 50,
    id,
    name: 'Rectangle',
    parentId: null,
    rotation: 0,
    type: NodeType.rectangle,
    width: 50,
    x,
    y,
  }) as TSceneNode;

const nodesById = { a: box('a', 0, 0), b: box('b', 200, 0) };

describe('getNearestNodeId', () => {
  it('should return the id of the box the point sits inside', () => {
    expect(getNearestNodeId(['a', 'b'], nodesById, { x: 25, y: 25 })).toBe('a');
  });

  it('should return the nearest box when the point is in the gap between them', () => {
    // gap spans x 50..200; x=90 is closer to a's right edge (50) than b's left edge (200)
    expect(getNearestNodeId(['a', 'b'], nodesById, { x: 90, y: 25 })).toBe('a');
    expect(getNearestNodeId(['a', 'b'], nodesById, { x: 170, y: 25 })).toBe('b');
  });

  it('should ignore ids missing from the map and return null when none resolve', () => {
    expect(getNearestNodeId(['ghost'], nodesById, { x: 0, y: 0 })).toBeNull();
    expect(getNearestNodeId([], nodesById, { x: 0, y: 0 })).toBeNull();
  });
});
