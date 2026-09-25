// types
import { BooleanOperation, NodeType } from 'types/design/enums';
import { TBooleanNode, TLineNode, TRectangleNode, TSceneNode, TVectorNode } from 'types/design/types';

// utils
import { getBooleanVectorNode } from '../getBooleanVectorNode';
import { getPolygonArea } from 'components/Design/Canvas/utils/getPolygonArea';
import { getVectorFillLoopPoints } from '../../vectorNetwork/getVectorFillLoopPoints/getVectorFillLoopPoints';

const makeRectangle = (id: string, parentId: string, x: number, hidden?: boolean): TRectangleNode => ({
  fills: [],
  height: 100,
  hidden,
  id,
  name: id,
  parentId,
  rotation: 0,
  type: NodeType.rectangle,
  width: 100,
  x,
  y: 0,
});

const makeBoolean = (id: string, childIds: string[], booleanOperation: BooleanOperation, parentId: string | null = null): TBooleanNode => ({
  booleanOperation,
  childIds,
  fills: [],
  height: 100,
  id,
  name: id,
  parentId,
  rotation: 0,
  type: NodeType.boolean,
  width: 100,
  x: 0,
  y: 0,
});

describe('getBooleanVectorNode', () => {
  it('should reuse the cached result while the operands are unchanged', () => {
    // mock
    const node = makeBoolean('union', ['a', 'b'], BooleanOperation.union);
    const nodesById: Record<string, TSceneNode> = { a: makeRectangle('a', 'union', 0), b: makeRectangle('b', 'union', 50), union: node };

    // action
    const first = getBooleanVectorNode(node, nodesById);
    const second = getBooleanVectorNode(node, { ...nodesById });

    // result
    expect(second).toBe(first);
  });

  it('should recompute when an operand moves', () => {
    // mock
    const node = makeBoolean('union', ['a', 'b'], BooleanOperation.union);
    const nodesById: Record<string, TSceneNode> = { a: makeRectangle('a', 'union', 0), b: makeRectangle('b', 'union', 50), union: node };

    // action
    const first = getBooleanVectorNode(node, nodesById);
    const second = getBooleanVectorNode(node, { ...nodesById, b: makeRectangle('b', 'union', 300) });

    // result
    expect(second).not.toBe(first);
    expect(second?.filledFaceKeys).toHaveLength(2);
  });

  it('should ignore hidden operands', () => {
    // mock
    const node = makeBoolean('intersect', ['a', 'b'], BooleanOperation.intersect);
    const nodesById: Record<string, TSceneNode> = {
      a: makeRectangle('a', 'intersect', 0),
      b: makeRectangle('b', 'intersect', 300, true),
      intersect: node,
    };

    // action
    const result = getBooleanVectorNode(node, nodesById);

    // result
    expect(result?.filledFaceKeys).toHaveLength(1);
  });

  it('should use a nested boolean result as an operand', () => {
    // mock
    const inner = makeBoolean('inner', ['a', 'b'], BooleanOperation.union, 'outer');
    const outer = makeBoolean('outer', ['inner', 'c'], BooleanOperation.subtract);
    const nodesById: Record<string, TSceneNode> = {
      a: makeRectangle('a', 'inner', 0),
      b: makeRectangle('b', 'inner', 50),
      c: makeRectangle('c', 'outer', 100),
      inner,
      outer,
    };

    // action
    const result = getBooleanVectorNode(outer, nodesById);

    // result
    expect(Math.max(...Object.values(result?.vertices ?? {}).map((vertex) => vertex.x))).toBe(100);
    expect(result?.filledFaceKeys).toHaveLength(1);
  });

  it('should return null when no operand has geometry', () => {
    // mock
    const node = makeBoolean('union', ['missing'], BooleanOperation.union);

    // action / result
    expect(getBooleanVectorNode(node, { union: node })).toBeNull();
  });

  it('should turn the stroke of an unfilled vector into an area filled like the rest of the boolean', () => {
    // mock
    const vector: TVectorNode = {
      defaultFill: null,
      filledFaceKeys: [],
      id: 'outline',
      name: 'outline',
      parentId: 'union',
      rotation: 0,
      segments: {
        s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null },
        s2: { endId: 'v3', id: 's2', startId: 'v2', tangentEnd: null, tangentStart: null },
        s3: { endId: 'v4', id: 's3', startId: 'v3', tangentEnd: null, tangentStart: null },
        s4: { endId: 'v1', id: 's4', startId: 'v4', tangentEnd: null, tangentStart: null },
      },
      strokeColor: '#000000',
      strokeWidth: 4,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: {
        v1: { id: 'v1', x: 300, y: 0 },
        v2: { id: 'v2', x: 400, y: 0 },
        v3: { id: 'v3', x: 400, y: 100 },
        v4: { id: 'v4', x: 300, y: 100 },
      },
    };
    const node = makeBoolean('union', ['outline'], BooleanOperation.union);

    // action
    const result = getBooleanVectorNode(node, { outline: vector, union: node })!;
    const areas = result.filledFaceKeys
      .map((key) => getVectorFillLoopPoints(result, key))
      .map((points) => (points ? getPolygonArea(points) : 0))
      .sort((areaA, areaB) => areaB - areaA);

    // result
    expect(areas[0] - areas[1]).toBeCloseTo(104 * 104 - 96 * 96, 0);
  });

  it('should join a line drawn without a stroke width as the 1px stroke shape the canvas draws', () => {
    // mock
    const line: TLineNode = {
      id: 'line',
      name: 'line',
      parentId: 'union',
      stroke: '#ffffff',
      type: NodeType.line,
      x1: 50,
      x2: 300,
      y1: 50,
      y2: 50,
    };
    const node = makeBoolean('union', ['a', 'line'], BooleanOperation.union);

    // action
    const result = getBooleanVectorNode(node, { a: makeRectangle('a', 'union', 0), line, union: node });

    // result
    const xs = Object.values(result?.vertices ?? {}).map((vertex) => vertex.x);

    expect(Math.max(...xs)).toBe(300);
  });

  it('should keep the geometry but restyle a copy of the boolean with other fills', () => {
    // mock
    const node = makeBoolean('restyled', ['ra', 'rb'], BooleanOperation.union);
    const nodesById: Record<string, TSceneNode> = {
      ra: makeRectangle('ra', 'restyled', 0),
      rb: makeRectangle('rb', 'restyled', 50),
      restyled: node,
    };
    const fills = [{ color: '#ffffff', opacity: 100, type: 'solid' as const }];

    // action
    const original = getBooleanVectorNode(node, nodesById);
    const copy = getBooleanVectorNode({ ...node, fills }, nodesById);

    // result
    expect(copy?.segments).toBe(original?.segments);
    expect(copy?.defaultFill).toBe(fills);
  });

  it('should recompute when the operation changes', () => {
    // mock
    const node = makeBoolean('switched', ['sa', 'sb'], BooleanOperation.union);
    const nodesById: Record<string, TSceneNode> = {
      sa: makeRectangle('sa', 'switched', 0),
      sb: makeRectangle('sb', 'switched', 50),
      switched: node,
    };

    // action
    const union = getBooleanVectorNode(node, nodesById);
    const subtract = getBooleanVectorNode({ ...node, booleanOperation: BooleanOperation.subtract }, nodesById);

    // result
    expect(subtract?.segments).not.toBe(union?.segments);
  });
});
