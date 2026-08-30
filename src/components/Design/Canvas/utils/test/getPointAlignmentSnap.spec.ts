// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { getPointAlignmentSnap } from '../getPointAlignmentSnap';

const rect = (id: string, x: number, y: number, width = 100, height = 100): TSceneNode =>
  ({ fill: '#000', height, id, name: 'Rectangle', parentId: null, rotation: 0, type: NodeType.rectangle, width, x, y }) as TSceneNode;

describe('getPointAlignmentSnap', () => {
  it('should return the raw point and no guide when nothing is within tolerance', () => {
    // action
    const result = getPointAlignmentSnap({ x: 197, y: 50 }, {}, [], 5);

    // result
    expect(result).toEqual({ guide: null, point: { x: 197, y: 50 } });
  });

  it('should snap the point onto a nearby candidate and draw the guide along that candidate’s full height', () => {
    // mock — a candidate rect whose left edge sits 3px past the raw point on the x axis
    const nodes = { b: rect('b', 200, 300, 100, 100) };

    // action
    const result = getPointAlignmentSnap({ x: 197, y: 50 }, nodes, [], 5);

    // result — x snaps to 200, y is untouched (no candidate point near y:50); the guide spans b's
    // full height (300..400)
    expect(result.point).toEqual({ x: 200, y: 50 });
    expect(result.guide).toEqual({ horizontal: null, vertical: { anchor: { x: 200, y: 300 }, match: { x: 200, y: 400 } } });
  });

  it('should snap the point onto a nearby candidate and draw the guide along that candidate’s full width', () => {
    // mock — a candidate rect whose top edge sits 3px past the raw point on the y axis
    const nodes = { b: rect('b', 300, 200, 100, 100) };

    // action
    const result = getPointAlignmentSnap({ x: 50, y: 197 }, nodes, [], 5);

    // result — y snaps to 200, x is untouched; the guide spans b's full width (300..400)
    expect(result.point).toEqual({ x: 50, y: 200 });
    expect(result.guide).toEqual({ horizontal: { anchor: { x: 300, y: 200 }, match: { x: 400, y: 200 } }, vertical: null });
  });

  it('should exclude ids in the excludedIds list from candidacy', () => {
    // mock — the only nearby candidate is the node being resized itself
    const nodes = { a: rect('a', 200, 300, 100, 100) };

    // action
    const result = getPointAlignmentSnap({ x: 197, y: 50 }, nodes, ['a'], 5);

    // result
    expect(result).toEqual({ guide: null, point: { x: 197, y: 50 } });
  });

  it('should ignore a candidate node that is not snap-eligible, such as a group', () => {
    // mock
    const nodes = { b: { ...rect('b', 200, 300), type: NodeType.group } as TSceneNode };

    // action
    const result = getPointAlignmentSnap({ x: 197, y: 50 }, nodes, [], 5);

    // result
    expect(result).toEqual({ guide: null, point: { x: 197, y: 50 } });
  });
});
