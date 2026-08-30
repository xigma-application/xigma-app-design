// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { getDragAlignmentSnap } from '../getDragAlignmentSnap';

const rect = (id: string, x: number, y: number, width = 100, height = 100): TSceneNode =>
  ({
    fill: '#000',
    height,
    id,
    name: 'Rectangle',
    parentId: null,
    rotation: 0,
    type: NodeType.rectangle,
    width,
    x,
    y,
  }) as TSceneNode;

const line = (id: string): TSceneNode =>
  ({ id, name: 'Line', parentId: null, stroke: '#000', type: NodeType.line, x1: 0, x2: 10, y1: 0, y2: 0 }) as TSceneNode;

describe('getDragAlignmentSnap', () => {
  it('should return the raw delta and no guide when no dragged node is snap-eligible', () => {
    // mock — dragging a line, which never contributes snap points
    const nodes = { a: line('a') };

    // action
    const result = getDragAlignmentSnap(nodes, { a: { x: 0, y: 0 } }, { x: 5, y: 7 }, 5);

    // result
    expect(result).toEqual({ delta: { x: 5, y: 7 }, guide: null });
  });

  it('should return the raw delta and no guide when there is nothing to snap onto', () => {
    // mock — a lone dragged rect, no other shapes on the scene
    const nodes = { a: rect('a', 0, 0) };

    // action
    const result = getDragAlignmentSnap(nodes, { a: { x: 0, y: 0 } }, { x: 5, y: 7 }, 5);

    // result
    expect(result).toEqual({ delta: { x: 5, y: 7 }, guide: null });
  });

  it('should correct the delta and produce a guide when the dragged shape lands within tolerance of a stationary one', () => {
    // mock — a dragged rect moving right by 97 lands its right edge (0+100+97=197) 3px short of
    // the stationary rect's left edge (200)
    const nodes = { a: rect('a', 0, 0), b: rect('b', 200, 0) };

    // action
    const result = getDragAlignmentSnap(nodes, { a: { x: 0, y: 0 } }, { x: 97, y: 0 }, 5);

    // result — corrected by +3 so the edges land flush
    expect(result.delta).toEqual({ x: 100, y: 0 });
    expect(result.guide).not.toBeNull();
  });

  it('should never snap a dragged shape onto another shape that is also being dragged', () => {
    // mock — both rects are in nodeOrigins, so neither can be the other's candidate
    const nodes = { a: rect('a', 0, 0), b: rect('b', 200, 0) };

    // action
    const result = getDragAlignmentSnap(nodes, { a: { x: 0, y: 0 }, b: { x: 200, y: 0 } }, { x: 97, y: 0 }, 5);

    // result — no correction, since the only nearby shape is also dragged
    expect(result.delta).toEqual({ x: 97, y: 0 });
    expect(result.guide).toBeNull();
  });

  it('should ignore a candidate node that is not snap-eligible, such as a frame', () => {
    // mock
    const nodes = { a: rect('a', 0, 0), b: { ...rect('b', 200, 0), type: NodeType.frame } as TSceneNode };

    // action
    const result = getDragAlignmentSnap(nodes, { a: { x: 0, y: 0 } }, { x: 97, y: 0 }, 5);

    // result
    expect(result.delta).toEqual({ x: 97, y: 0 });
    expect(result.guide).toBeNull();
  });

  it('should ignore a dragged origin that is not the plain {x,y} shape, such as a line endpoint pair', () => {
    // mock
    const nodes = { a: line('a') };

    // action
    const result = getDragAlignmentSnap(nodes, { a: { x1: 0, x2: 10, y1: 0, y2: 0 } }, { x: 5, y: 7 }, 5);

    // result
    expect(result).toEqual({ delta: { x: 5, y: 7 }, guide: null });
  });
});
