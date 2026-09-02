// types
import { NodeType } from 'types/design/enums';
import { TLineNode, TRectangleNode, TVectorNode } from 'types/design/types';

// utils
import { getNodeOutlineAsStrokeVector } from '../getNodeOutlineAsStrokeVector';
import { groupFilledFacesForRendering } from 'utils/canvas/drawVectorNode/groupFilledFacesForRendering';

const buildRectangle = (overrides: Partial<TRectangleNode> = {}): TRectangleNode => ({
  fill: '#ff0000',
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

describe('getNodeOutlineAsStrokeVector', () => {
  it('should return null when the node has no stroke', () => {
    // result
    expect(getNodeOutlineAsStrokeVector(buildRectangle())).toBeNull();
  });

  it('should merge a shape’s fill and its stroke outline into one replacement vector, keeping the source id', () => {
    // mock
    const node = buildRectangle({ strokeColor: '#000000', strokeWidth: 4 });

    // action
    const result = getNodeOutlineAsStrokeVector(node);

    // result — id/name/parent/rotation carried over for a direct replaceNode; fill face (from
    // convertNodeToVector) and the new stroke ring face are both present
    expect(result?.type).toBe(NodeType.vector);
    expect(result?.id).toBe('rect-1');
    expect(result?.name).toBe('Rectangle');
    expect(result?.parentId).toBe('frame-1');
    expect(result?.filledFaceKeys.length).toBeGreaterThanOrEqual(2);
    expect(Object.values(result?.fillByKey ?? {})).toEqual(
      expect.arrayContaining([[{ color: '#ff0000', opacity: 100, type: 'solid' }], [{ color: '#000000', opacity: 100, type: 'solid' }]]),
    );

    // every declared face must actually resolve back to real points, not just exist as a key —
    // this is exactly the check that would have caught the bridged-ring rendering bug
    const facesByRender = groupFilledFacesForRendering(result!);
    const totalResolvedFaces = facesByRender.reduce((sum, group) => sum + group.polygons.length, 0);

    expect(totalResolvedFaces).toBe(result?.filledFaceKeys.length);
  });

  it('should merge an existing Vector’s own geometry (unchanged) with its stroke outline', () => {
    // mock — a simple open 2-point vector path
    const node: TVectorNode = {
      defaultFill: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
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
    const result = getNodeOutlineAsStrokeVector(node);

    // result — the original 2 vertices are still present, plus new ones for the stroke band
    expect(result?.id).toBe('vector-1');
    expect(Object.keys(result?.vertices ?? {})).toEqual(expect.arrayContaining(['a', 'b']));
    expect(Object.keys(result?.vertices ?? {}).length).toBeGreaterThan(2);
  });

  it('should fall back to an empty fill color when merging a Vector with no fillColor of its own', () => {
    // mock — a closed 3-point vector path with no fill set (fillColor: null)
    const node: TVectorNode = {
      defaultFill: null,
      filledFaceKeys: [],
      id: 'vector-2',
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments: {
        s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null },
        s2: { endId: 'c', id: 's2', startId: 'b', tangentEnd: null, tangentStart: null },
        s3: { endId: 'a', id: 's3', startId: 'c', tangentEnd: null, tangentStart: null },
      },
      strokeColor: '#000000',
      strokeWidth: 4,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 10, y: 0 }, c: { id: 'c', x: 0, y: 10 } },
    };

    // action
    const result = getNodeOutlineAsStrokeVector(node);

    // result
    expect(result?.defaultFill).toEqual([{ color: '', opacity: 100, type: 'solid' }]);
  });

  it('should return the stroke outline vector alone for a Line, since it has no fill of its own', () => {
    // mock
    const node: TLineNode = {
      id: 'line-1',
      name: 'Line',
      parentId: 'frame-1',
      stroke: '#000000',
      strokeWidth: 4,
      type: NodeType.line,
      x1: 0,
      x2: 100,
      y1: 0,
      y2: 0,
    };

    // action
    const result = getNodeOutlineAsStrokeVector(node);

    // result
    expect(result?.id).toBe('line-1');
    expect(result?.defaultFill).toEqual([{ color: '#000000', opacity: 100, type: 'solid' }]);
    expect(Object.keys(result?.vertices ?? {})).toHaveLength(4);
  });
});
