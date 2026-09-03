// types
import { NodeType } from 'types/design/enums';
import { TFrameNode, TRectangleNode, TSceneNode } from 'types/design/types';

// utils
import { getFrameAtWorldPoint } from '../getFrameAtWorldPoint';

const frame = (overrides: Partial<TFrameNode> = {}): TFrameNode => ({
  fill: '#fff',
  height: 100,
  id: 'frame-1',
  name: 'Frame',
  parentId: null,
  rotation: 0,
  childIds: [], clipContent: true, type: NodeType.frame,
  width: 100,
  x: 0,
  y: 0,
  ...overrides,
});

const rect = (overrides: Partial<TRectangleNode> = {}): TRectangleNode => ({
  fill: '#000',
  height: 100,
  id: 'rect-1',
  name: 'Rectangle',
  parentId: null,
  rotation: 0,
  type: NodeType.rectangle,
  width: 100,
  x: 0,
  y: 0,
  ...overrides,
});

describe('getFrameAtWorldPoint', () => {
  it('should return the frame whose world bounds contain the point', () => {
    // mock
    const nodes: TSceneNode[] = [frame({ id: 'frame-1', x: 0, y: 0 })];

    // result
    expect(getFrameAtWorldPoint({ x: 50, y: 50 }, nodes)).toBe(nodes[0]);
  });

  it('should return null when the point falls outside every frame', () => {
    // mock
    const nodes: TSceneNode[] = [frame({ x: 0, y: 0 })];

    // result
    expect(getFrameAtWorldPoint({ x: 500, y: 500 }, nodes)).toBeNull();
  });

  it('should ignore non-frame nodes under the point', () => {
    // mock
    const nodes: TSceneNode[] = [rect({ x: 0, y: 0 })];

    // result
    expect(getFrameAtWorldPoint({ x: 50, y: 50 }, nodes)).toBeNull();
  });

  it('should ignore a rotated frame', () => {
    // mock
    const nodes: TSceneNode[] = [frame({ rotation: 15, x: 0, y: 0 })];

    // result
    expect(getFrameAtWorldPoint({ x: 50, y: 50 }, nodes)).toBeNull();
  });

  it('should return the top-most frame when frames overlap', () => {
    // mock — render order is back-to-front, so the last entry paints on top
    const back = frame({ height: 200, id: 'back', width: 200, x: 0, y: 0 });
    const front = frame({ height: 200, id: 'front', width: 200, x: 50, y: 50 });
    const nodes: TSceneNode[] = [back, front];

    // result
    expect(getFrameAtWorldPoint({ x: 100, y: 100 }, nodes)).toBe(front);
  });
});
