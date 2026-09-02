// types
import { NodeType } from 'types/design/enums';
import { TPaint } from 'types/design/paint/types';
import { TVectorNode } from 'types/design/types';

// utils
import { captureVectorNodeDragSnapshot } from '../captureVectorNodeDragSnapshot';

const bakeVectorNodeRotationMock = vi.fn();
const groupFilledFacesForRenderingMock = vi.fn();
const flattenVectorSegmentsMock = vi.fn();
const getThickVectorPathVerticesMock = vi.fn();

vi.mock('components/Design/Canvas/utils/bakeVectorNodeRotation', () => ({
  bakeVectorNodeRotation: (...args: unknown[]): unknown => bakeVectorNodeRotationMock(...args),
}));
vi.mock('../groupFilledFacesForRendering', () => ({
  groupFilledFacesForRendering: (...args: unknown[]): unknown => groupFilledFacesForRenderingMock(...args),
}));
vi.mock('../../vectorNetwork/flattenVectorSegments', () => ({
  flattenVectorSegments: (...args: unknown[]): unknown => flattenVectorSegmentsMock(...args),
}));
vi.mock('../../vectorNetwork/getThickVectorPathVertices/getThickVectorPathVertices', () => ({
  getThickVectorPathVertices: (...args: unknown[]): unknown => getThickVectorPathVerticesMock(...args),
}));

const baseNode: TVectorNode = {
  fillColor: '#ff0000',
  filledFaceKeys: ['s1,s2,s3'],
  id: '1',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments: {},
  strokeColor: '#00ff00',
  strokeWidth: 4,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: {},
};

describe('captureVectorNodeDragSnapshot', () => {
  beforeEach(() => {
    bakeVectorNodeRotationMock.mockClear();
    groupFilledFacesForRenderingMock.mockClear();
    flattenVectorSegmentsMock.mockClear();
    getThickVectorPathVerticesMock.mockClear();
    groupFilledFacesForRenderingMock.mockReturnValue([]);
    flattenVectorSegmentsMock.mockReturnValue([]);
    getThickVectorPathVerticesMock.mockReturnValue([]);
  });

  it('should capture a zeroed delta, the grouped fill faces, and the stroke color/vertices from the node as given', () => {
    // mock
    const points = [[{ x: 0, y: 0 }]];

    const paint: TPaint[] = [{ color: '#ff0000', opacity: 100, type: 'solid' }];

    groupFilledFacesForRenderingMock.mockReturnValue([{ paint, polygons: points }]);
    getThickVectorPathVerticesMock.mockReturnValue([0, 0, 10, 0, 10, 1]);

    // before
    const snapshot = captureVectorNodeDragSnapshot(baseNode);

    // result
    expect(bakeVectorNodeRotationMock).not.toHaveBeenCalled();
    expect(groupFilledFacesForRenderingMock.mock.calls[0][0]).toBe(baseNode);
    expect(flattenVectorSegmentsMock.mock.calls[0][0]).toBe(baseNode);
    expect(getThickVectorPathVerticesMock).toHaveBeenCalledWith([], 2);
    expect(snapshot).toEqual({
      deltaX: 0,
      deltaY: 0,
      facesByPaint: [{ paint, points }],
      strokeColor: '#00ff00',
      strokeVertices: [0, 0, 10, 0, 10, 1],
    });
  });

  it('should skip stroke vertex derivation entirely for a node carrying a width profile', () => {
    // mock
    const node: TVectorNode = {
      ...baseNode,
      widthProfile: { points: { p1: { id: 'p1', leftOffset: 10, position: 0.5, rightOffset: 10 } } },
    };

    // before
    const snapshot = captureVectorNodeDragSnapshot(node);

    // result
    expect(getThickVectorPathVerticesMock).not.toHaveBeenCalled();
    expect(snapshot.strokeVertices).toEqual([]);
  });

  it('should bake rotation into a new node before deriving faces and stroke, but not mutate the original node', () => {
    // mock
    const node: TVectorNode = { ...baseNode, rotation: 45 };
    const bakedSegments = { s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null } };
    const bakedVertices = { a: { id: 'a', x: 1, y: 2 } };

    bakeVectorNodeRotationMock.mockReturnValue({ rotation: 0, segments: bakedSegments, vertices: bakedVertices });

    // before
    captureVectorNodeDragSnapshot(node);

    // result
    expect(bakeVectorNodeRotationMock).toHaveBeenCalledWith(node);
    expect(groupFilledFacesForRenderingMock).toHaveBeenCalledWith({
      ...node,
      rotation: 0,
      segments: bakedSegments,
      vertices: bakedVertices,
    });
    expect(flattenVectorSegmentsMock).toHaveBeenCalledWith({ ...node, rotation: 0, segments: bakedSegments, vertices: bakedVertices });
    expect(node.rotation).toBe(45);
  });
});
