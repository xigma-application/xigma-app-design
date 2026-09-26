// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { getLineBoxFromPoints } from 'utils/canvas/line/getLineBoxFromPoints';
import { getUnrotatedNodeQueryPoint } from '../getUnrotatedNodeQueryPoint';

const buildNode = (overrides: Partial<TSceneNode> = {}): TSceneNode =>
  ({
    childIds: [],
    clipContent: true,
    fill: '#ff0000',
    height: 100,
    id: 'a',
    name: 'Frame',
    parentId: null,
    rotation: 0,
    type: NodeType.frame,
    width: 100,
    x: 0,
    y: 0,
    ...overrides,
  }) as TSceneNode;

describe('getUnrotatedNodeQueryPoint', () => {
  it('should return the exact same point reference when the node has no rotation', () => {
    // mock
    const point = { x: 37, y: -12 };
    const node = buildNode({ rotation: 0 });

    // result
    expect(getUnrotatedNodeQueryPoint(point, node)).toBe(point);
  });

  it("should rotate the point backwards around the node's own bounds center", () => {
    // mock — a 100x100 node centered at (50,50); a point 90deg clockwise of the center, rotated back
    const node = buildNode({ height: 100, rotation: 90, width: 100, x: 0, y: 0 });

    // result
    const result = getUnrotatedNodeQueryPoint({ x: 50, y: 150 }, node);

    expect(result.x).toBeCloseTo(150);
    expect(result.y).toBeCloseTo(50);
  });

  it('should turn the point back around the middle of a turned line', () => {
    // mock
    const point = { x: 10, y: 10 };
    const line: TSceneNode = {
      id: 'a',
      name: 'Line',
      parentId: null,
      strokes: [{ color: '#000000', opacity: 100, type: 'solid' }],
      type: NodeType.line,
      ...getLineBoxFromPoints({ x1: 0, x2: 10, y1: 0, y2: 10 }),
    };

    // result
    expect(getUnrotatedNodeQueryPoint(point, line)).toEqual({ x: expect.closeTo(5 + Math.hypot(5, 5)), y: expect.closeTo(5) });
  });

  it('should return the exact same point reference for a vector node, whose rotation is baked into its geometry instead', () => {
    // mock
    const point = { x: 5, y: 5 };
    const vector: TSceneNode = {
      defaultFill: [{ color: '#000', opacity: 100, type: 'solid' }],
      filledFaceKeys: [],
      id: 'a',
      name: 'Vector',
      parentId: null,
      rotation: 45,
      segments: {},
      strokeWidth: 1,
      strokes: [{ color: '#000', opacity: 100, type: 'solid' }],
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: {},
    };

    // result
    expect(getUnrotatedNodeQueryPoint(point, vector)).toBe(point);
  });
});
