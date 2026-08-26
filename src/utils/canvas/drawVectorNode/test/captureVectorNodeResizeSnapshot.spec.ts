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
    const snapshot = captureVectorNodeResizeSnapshot(baseNode);

    // result
    expect(groupFilledFacesByColorMock).toHaveBeenCalledWith(baseNode);
    expect(flattenVectorSegmentsMock).toHaveBeenCalledWith(baseNode);
    expect(snapshot).toEqual({
      anchorX: null,
      anchorY: null,
      facesByColor: [{ color: '#ff0000', points }],
      flattenedSegments: flattened,
      scaleX: 1,
      scaleY: 1,
      strokeColor: '#00ff00',
      strokeWidth: 4,
    });
  });
});
