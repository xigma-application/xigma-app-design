// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { getCandidateShapes } from '../getCandidateShapes';

const rect = (id: string, x: number, y: number): TSceneNode =>
  ({
    fill: '#000',
    height: 40,
    id,
    name: 'Rectangle',
    parentId: null,
    rotation: 0,
    type: NodeType.rectangle,
    width: 40,
    x,
    y,
  }) as TSceneNode;

describe('getCandidateShapes', () => {
  it('should return the bounds and 9 snap points for an eligible node', () => {
    // action
    const candidates = getCandidateShapes({ a: rect('a', 10, 20) }, []);

    // result
    expect(candidates).toEqual([{ bounds: { height: 40, width: 40, x: 10, y: 20 }, points: expect.any(Array) }]);
    expect(candidates[0].points).toHaveLength(9);
  });

  it('should exclude ids in the excluded list', () => {
    // action
    const candidates = getCandidateShapes({ a: rect('a', 0, 0), b: rect('b', 100, 0) }, ['a']);

    // result
    expect(candidates.map((candidate) => candidate.bounds)).toEqual([{ height: 40, width: 40, x: 100, y: 0 }]);
  });

  it('should exclude a node whose type is not snap-eligible, such as a group', () => {
    // mock
    const nodes = { a: { ...rect('a', 0, 0), type: NodeType.group } as TSceneNode };

    // action
    const candidates = getCandidateShapes(nodes, []);

    // result
    expect(candidates).toEqual([]);
  });
});
