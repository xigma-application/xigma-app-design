// types
import { BooleanOperation, NodeType } from 'types/design/enums';
import { TBooleanNode, TRectangleNode, TSceneNode } from 'types/design/types';

// utils
import { getBooleanVectorNode } from '../getBooleanVectorNode';

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
});
