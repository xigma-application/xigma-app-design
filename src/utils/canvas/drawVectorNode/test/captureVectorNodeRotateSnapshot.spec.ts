// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { captureVectorNodeRotateSnapshot } from '../captureVectorNodeRotateSnapshot';

const getRenderedVectorNodeMock = vi.fn();
const groupFilledFacesForRenderingMock = vi.fn();
const flattenVectorSegmentsMock = vi.fn();
const getThickVectorPathVerticesMock = vi.fn();
const getVectorNodeBoundsMock = vi.fn();

vi.mock('components/Design/Canvas/utils/getRenderedVectorNode', () => ({
  getRenderedVectorNode: (...args: unknown[]): unknown => getRenderedVectorNodeMock(...args),
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
vi.mock('../../vectorNetwork/getVectorNodeBounds', () => ({
  getVectorNodeBounds: (...args: unknown[]): unknown => getVectorNodeBoundsMock(...args),
}));

const baseNode: TVectorNode = {
  fillColor: '#ff0000',
  filledFaceKeys: ['s1,s2,s3'],
  id: '1',
  name: 'Vector',
  parentId: null,
  rotation: 30,
  segments: {},
  strokeColor: '#00ff00',
  strokeWidth: 4,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: {},
};

describe('captureVectorNodeRotateSnapshot', () => {
  beforeEach(() => {
    getRenderedVectorNodeMock.mockReset();
    groupFilledFacesForRenderingMock.mockReset();
    flattenVectorSegmentsMock.mockReset();
    getThickVectorPathVerticesMock.mockReset();
    getVectorNodeBoundsMock.mockReset();
    groupFilledFacesForRenderingMock.mockReturnValue([]);
    flattenVectorSegmentsMock.mockReturnValue([]);
    getThickVectorPathVerticesMock.mockReturnValue([]);
    getVectorNodeBoundsMock.mockReturnValue({ height: 0, width: 0, x: 0, y: 0 });
  });

  it('should capture a zeroed delta, the pivot from the node’s own local bounds, the grouped fill faces, and the stroke color/vertices derived from the already-rendered (baked) node', () => {
    // mock
    const renderedNode: TVectorNode = { ...baseNode, rotation: 0 };
    const points = [[{ x: 0, y: 0 }]];

    getRenderedVectorNodeMock.mockReturnValue(renderedNode);
    groupFilledFacesForRenderingMock.mockReturnValue([{ color: '#ff0000', polygons: points }]);
    getThickVectorPathVerticesMock.mockReturnValue([0, 0, 10, 0, 10, 1]);
    getVectorNodeBoundsMock.mockReturnValue({ height: 20, width: 40, x: 10, y: 10 });

    // before
    const snapshot = captureVectorNodeRotateSnapshot(baseNode);

    // result
    expect(getRenderedVectorNodeMock).toHaveBeenCalledWith(baseNode);
    expect(groupFilledFacesForRenderingMock).toHaveBeenCalledWith(renderedNode);
    expect(flattenVectorSegmentsMock).toHaveBeenCalledWith(renderedNode);
    expect(getVectorNodeBoundsMock).toHaveBeenCalledWith(baseNode);
    expect(snapshot).toEqual({
      deltaDegrees: 0,
      facesByColor: [{ color: '#ff0000', points }],
      pivot: { x: 30, y: 20 },
      strokeColor: '#00ff00',
      strokeVertices: [0, 0, 10, 0, 10, 1],
    });
  });

  it('should skip stroke vertex derivation entirely for a node carrying a width profile', () => {
    // mock
    const renderedNode: TVectorNode = {
      ...baseNode,
      rotation: 0,
      widthProfile: { points: { p1: { id: 'p1', leftOffset: 10, position: 0.5, rightOffset: 10 } } },
    };

    getRenderedVectorNodeMock.mockReturnValue(renderedNode);

    // before
    const snapshot = captureVectorNodeRotateSnapshot(baseNode);

    // result
    expect(getThickVectorPathVerticesMock).not.toHaveBeenCalled();
    expect(snapshot.strokeVertices).toEqual([]);
  });
});
