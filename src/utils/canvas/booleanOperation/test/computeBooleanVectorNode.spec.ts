// types
import { BooleanOperation, NodeType } from 'types/design/enums';
import { TBooleanNode, TRectangleNode, TVectorNode } from 'types/design/types';

// utils
import { computeBooleanVectorNode } from '../computeBooleanVectorNode';
import { convertNodeToVector } from '../../vectorNetwork/convertShapeToVector/convertNodeToVector';
import { getVectorFillLoopPoints } from '../../vectorNetwork/getVectorFillLoopPoints/getVectorFillLoopPoints';
import { getPolygonArea } from 'components/Design/Canvas/utils/getPolygonArea';

const makeRectangle = (id: string, x: number, y: number, size: number): TRectangleNode => ({
  fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
  height: size,
  id,
  name: id,
  parentId: 'boolean',
  rotation: 0,
  type: NodeType.rectangle,
  width: size,
  x,
  y,
});

const makeBoolean = (booleanOperation: BooleanOperation): TBooleanNode => ({
  booleanOperation,
  childIds: [],
  fills: [{ color: '#00ff00', opacity: 100, type: 'solid' }],
  height: 0,
  id: 'boolean',
  name: 'Boolean',
  parentId: null,
  rotation: 0,
  type: NodeType.boolean,
  width: 0,
  x: 0,
  y: 0,
});

const getEvenOddArea = (node: TVectorNode): number => {
  const areas = node.filledFaceKeys
    .map((key) => getVectorFillLoopPoints(node, key))
    .map((points) => (points ? getPolygonArea(points) : 0))
    .sort((areaA, areaB) => areaB - areaA);

  return areas.reduce((total, area, index) => (index === 0 ? area : total - area), 0);
};

const bottom = convertNodeToVector(makeRectangle('bottom', 0, 0, 100));
const top = convertNodeToVector(makeRectangle('top', 50, 50, 100));

describe('computeBooleanVectorNode', () => {
  it('should return null without operands', () => {
    // action / result
    expect(computeBooleanVectorNode(makeBoolean(BooleanOperation.union), [])).toBeNull();
  });

  it('should outline two overlapping rectangles as one shape for a union', () => {
    // action
    const result = computeBooleanVectorNode(makeBoolean(BooleanOperation.union), [bottom, top])!;

    // result
    expect(Object.keys(result.segments)).toHaveLength(8);
    expect(result.filledFaceKeys).toHaveLength(1);
    expect(getEvenOddArea(result)).toBeCloseTo(17500);
    expect(Object.values(result.fillByKey ?? {})).toEqual([[{ color: '#00ff00', opacity: 100, type: 'solid' }]]);
  });

  it('should keep only the bottom shape minus the top one for a subtract', () => {
    // action
    const result = computeBooleanVectorNode(makeBoolean(BooleanOperation.subtract), [bottom, top])!;

    // result
    expect(Object.keys(result.segments)).toHaveLength(6);
    expect(getEvenOddArea(result)).toBeCloseTo(7500);
  });

  it('should keep only the overlap for an intersect', () => {
    // action
    const result = computeBooleanVectorNode(makeBoolean(BooleanOperation.intersect), [bottom, top])!;

    // result
    expect(Object.keys(result.segments)).toHaveLength(4);
    expect(getEvenOddArea(result)).toBeCloseTo(2500);
  });

  it('should keep everything except the overlap for an exclude', () => {
    // action
    const result = computeBooleanVectorNode(makeBoolean(BooleanOperation.exclude), [bottom, top])!;

    // result
    expect(result.filledFaceKeys).toHaveLength(2);
    expect(Object.keys(result.segments)).toHaveLength(12);
  });

  it('should merge shapes sharing aligned edges into one outline for a union', () => {
    // mock
    const aligned = convertNodeToVector(makeRectangle('aligned', 50, 0, 100));

    // action
    const result = computeBooleanVectorNode(makeBoolean(BooleanOperation.union), [bottom, aligned])!;

    // result
    expect(result.filledFaceKeys).toHaveLength(1);
    expect(getEvenOddArea(result)).toBeCloseTo(15000);
  });

  it('should keep separate outlines for disjoint shapes in a union', () => {
    // mock
    const far = convertNodeToVector(makeRectangle('far', 300, 0, 50));

    // action
    const result = computeBooleanVectorNode(makeBoolean(BooleanOperation.union), [bottom, far])!;

    // result
    expect(Object.keys(result.segments)).toHaveLength(8);
    expect(result.filledFaceKeys).toHaveLength(2);
  });

  it('should drop a shape fully inside another from a union outline', () => {
    // mock
    const inner = convertNodeToVector(makeRectangle('inner', 25, 25, 50));

    // action
    const result = computeBooleanVectorNode(makeBoolean(BooleanOperation.union), [bottom, inner])!;

    // result
    expect(Object.keys(result.segments)).toHaveLength(4);
    expect(getEvenOddArea(result)).toBeCloseTo(10000);
  });

  it('should cut a hole when subtracting a shape fully inside the bottom one', () => {
    // mock
    const inner = convertNodeToVector(makeRectangle('inner', 25, 25, 50));

    // action
    const result = computeBooleanVectorNode(makeBoolean(BooleanOperation.subtract), [bottom, inner])!;

    // result
    expect(Object.keys(result.segments)).toHaveLength(8);
    expect(getEvenOddArea(result)).toBeCloseTo(7500);
  });

  it('should stroke the result with the first visible solid stroke', () => {
    // mock
    const node = {
      ...makeBoolean(BooleanOperation.union),
      strokeWidth: 3,
      strokes: [{ color: '#0000ff', opacity: 100, type: 'solid' as const }],
    };

    // action
    const result = computeBooleanVectorNode(node, [bottom])!;

    // result
    expect(result).toMatchObject({ strokeColor: '#0000ff', strokeWidth: 3 });
  });
});
