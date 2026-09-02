// types
import { NodeType } from 'types/design/enums';
import { TEllipseNode, TLineNode, TRectangleNode, TVectorNode } from 'types/design/types';

// utils
import { getNodeStrokeOutline } from '../getNodeStrokeOutline';
import { getSolidPaintColor } from 'utils/design/paint/getSolidPaintColor';
import { groupFilledFacesForRendering } from 'utils/canvas/drawVectorNode/groupFilledFacesForRendering';

const buildRectangle = (overrides: Partial<TRectangleNode> = {}): TRectangleNode => ({
  fill: '#ffffff',
  height: 20,
  id: 'rect-1',
  name: 'Rectangle',
  parentId: 'frame-1',
  rotation: 0,
  type: NodeType.rectangle,
  width: 20,
  x: 0,
  y: 0,
  ...overrides,
});

describe('getNodeStrokeOutline', () => {
  it('should return null when the node has no strokeColor', () => {
    // mock
    const node = buildRectangle({ strokeWidth: 4 });

    // result
    expect(getNodeStrokeOutline(node)).toBeNull();
  });

  it('should return null when the node has strokeColor but zero strokeWidth', () => {
    // mock
    const node = buildRectangle({ strokeColor: '#000000', strokeWidth: 0 });

    // result
    expect(getNodeStrokeOutline(node)).toBeNull();
  });

  it('should build a ring-shaped vector outline for a sharp rectangle with a stroke', () => {
    // mock — 20x20 rect, stroke width 4 (half-width 2), well within the shape's bounds
    const node = buildRectangle({ strokeColor: '#123456', strokeWidth: 4 });

    // action
    const result = getNodeStrokeOutline(node);

    // result
    expect(result?.type).toBe(NodeType.vector);
    expect(result?.fillColor).toBe('#123456');
    expect(result?.name).toBe('Rectangle outline');
    expect(result?.filledFaceKeys).toHaveLength(2);
    expect(groupFilledFacesForRendering(result!).find((group) => getSolidPaintColor(group.paint) === '#123456')?.polygons).toHaveLength(2);
  });

  it('should build a solid (hole-less) outline when the stroke is thick enough to fully cover the rectangle', () => {
    // mock — 20x20 rect, stroke half-width (10) exactly consumes the whole shape, leaving no inner hole
    const node = buildRectangle({ strokeColor: '#123456', strokeWidth: 40 });

    // action
    const result = getNodeStrokeOutline(node);

    // result — still a single filled face, just without a hole
    expect(result?.filledFaceKeys).toHaveLength(1);
  });

  it('should build a ring outline for an ellipse with a stroke', () => {
    // mock
    const node: TEllipseNode = {
      fill: '#ffffff',
      height: 20,
      id: 'ellipse-1',
      name: 'Ellipse',
      parentId: null,
      rotation: 0,
      strokeColor: '#000000',
      strokeWidth: 4,
      type: NodeType.ellipse,
      width: 20,
      x: 0,
      y: 0,
    };

    // action
    const result = getNodeStrokeOutline(node);

    // result
    expect(result?.type).toBe(NodeType.vector);
    expect(result?.filledFaceKeys).toHaveLength(2);
    expect(groupFilledFacesForRendering(result!).find((group) => getSolidPaintColor(group.paint) === '#000000')?.polygons).toHaveLength(2);
  });

  it('should build a single-band outline for a line with a stroke', () => {
    // mock
    const node: TLineNode = {
      id: 'line-1',
      name: 'Line',
      parentId: null,
      stroke: '#000000',
      strokeWidth: 4,
      type: NodeType.line,
      x1: 0,
      x2: 100,
      y1: 0,
      y2: 0,
    };

    // action
    const result = getNodeStrokeOutline(node);

    // result
    expect(result?.type).toBe(NodeType.vector);
    expect(Object.keys(result?.vertices ?? {})).toHaveLength(4);
    expect(result?.filledFaceKeys).toHaveLength(1);
  });

  it('should return null for a line with no strokeWidth set', () => {
    // mock
    const node: TLineNode = {
      id: 'line-1',
      name: 'Line',
      parentId: null,
      stroke: '#000000',
      type: NodeType.line,
      x1: 0,
      x2: 100,
      y1: 0,
      y2: 0,
    };

    // result
    expect(getNodeStrokeOutline(node)).toBeNull();
  });

  it('should delegate to the general chain outline for a simple open vector path', () => {
    // mock — a straight two-point vector path
    const node: TVectorNode = {
      fillColor: null,
      filledFaceKeys: [],
      id: 'vector-1',
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments: { s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null } },
      strokeColor: '#000000',
      strokeWidth: 4,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } },
    };

    // action
    const result = getNodeStrokeOutline(node);

    // result
    expect(result?.type).toBe(NodeType.vector);
    expect(result?.filledFaceKeys).toHaveLength(1);
  });

  it('should return null for a vector network too complex for a simple chain (a branch point)', () => {
    // mock
    const node: TVectorNode = {
      fillColor: null,
      filledFaceKeys: [],
      id: 'vector-1',
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments: {
        s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null },
        s2: { endId: 'c', id: 's2', startId: 'a', tangentEnd: null, tangentStart: null },
        s3: { endId: 'd', id: 's3', startId: 'a', tangentEnd: null, tangentStart: null },
      },
      strokeColor: '#000000',
      strokeWidth: 4,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: {
        a: { id: 'a', x: 0, y: 0 },
        b: { id: 'b', x: 10, y: 0 },
        c: { id: 'c', x: -10, y: 0 },
        d: { id: 'd', x: 0, y: 10 },
      },
    };

    // result
    expect(getNodeStrokeOutline(node)).toBeNull();
  });
});
