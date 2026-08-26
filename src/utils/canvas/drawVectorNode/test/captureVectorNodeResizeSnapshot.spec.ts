// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { captureVectorNodeResizeSnapshot } from '../captureVectorNodeResizeSnapshot';

const groupFilledFacesByColorMock = vi.fn();
const flattenVectorSegmentsMock = vi.fn();

vi.mock('../groupFilledFacesByColor', () => ({
  groupFilledFacesByColor: (...args: unknown[]): unknown => groupFilledFacesByColorMock(...args),
}));
vi.mock('../../vectorNetwork/flattenVectorSegments', () => ({
  flattenVectorSegments: (...args: unknown[]): unknown => flattenVectorSegmentsMock(...args),
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

describe('captureVectorNodeResizeSnapshot', () => {
  beforeEach(() => {
    groupFilledFacesByColorMock.mockReset();
    flattenVectorSegmentsMock.mockReset();
    groupFilledFacesByColorMock.mockReturnValue(new Map());
    flattenVectorSegmentsMock.mockReturnValue([]);
  });

  it('should capture a zeroed scale, no anchor, the grouped fill faces, the flattened segments, and the stroke color/width from the node as given', () => {
    // mock
    const points = [[{ x: 0, y: 0 }]];
    const flattened = [{ endId: 'v2', points: [{ x: 0, y: 0 }], segmentId: 's1', startId: 'v1' }];

    groupFilledFacesByColorMock.mockReturnValue(new Map([['#ff0000', points]]));
    flattenVectorSegmentsMock.mockReturnValue(flattened);

    // before
    const snapshot = captureVectorNodeResizeSnapshot(baseNode, 0);

    // result
    expect(groupFilledFacesByColorMock).toHaveBeenCalledWith(baseNode);
    expect(flattenVectorSegmentsMock).toHaveBeenCalledWith(baseNode);
    expect(snapshot).toEqual({
      anchorX: null,
      anchorY: null,
      facesByColor: [{ color: '#ff0000', points }],
      flattenedSegments: flattened,
      pivot: { x: 0, y: 0 },
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      scaledCenter: { x: 0, y: 0 },
      strokeColor: '#00ff00',
      strokeWidth: 4,
    });
  });

  it('should capture the given rotation and seed pivot/scaledCenter from the node’s own bounds center', () => {
    // mock
    const node: TVectorNode = {
      ...baseNode,
      vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 50 } },
    };

    // before
    const snapshot = captureVectorNodeResizeSnapshot(node, 45);

    // result — bounds center of (0,0)-(100,50) is (50,25), used to seed both pivot and scaledCenter
    // so the very first render frame (before any pointermove updates them) matches the live bake exactly
    expect(snapshot.rotation).toBe(45);
    expect(snapshot.pivot).toEqual({ x: 50, y: 25 });
    expect(snapshot.scaledCenter).toEqual({ x: 50, y: 25 });
  });
});
