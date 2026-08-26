// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { drawShapeBuilderNodeFacesHatch } from '../drawShapeBuilderNodeFacesHatch';

const bakeVectorNodeRotationMock = vi.fn();
const deriveVectorFacesMock = vi.fn();
const drawVectorHatchFillMock = vi.fn();

vi.mock('components/Design/Canvas/utils/bakeVectorNodeRotation', () => ({
  bakeVectorNodeRotation: (...args: unknown[]): unknown => bakeVectorNodeRotationMock(...args),
}));
vi.mock('utils/canvas/vectorNetwork/deriveVectorFaces', () => ({
  deriveVectorFaces: (...args: unknown[]): unknown => deriveVectorFacesMock(...args),
}));
vi.mock('utils/canvas/drawVectorNode/drawVectorHatchFill', () => ({
  drawVectorHatchFill: (...args: unknown[]): void => drawVectorHatchFillMock(...args),
}));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const gl = {} as WebGL2RenderingContext;
const program = {} as WebGLProgram;
const buffer = {} as WebGLBuffer;

const node: TVectorNode = {
  fillColor: '#000000',
  filledFaceKeys: [],
  id: '1',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments: {},
  strokeColor: '#ffffff',
  strokeWidth: 1,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: {},
};

describe('drawShapeBuilderNodeFacesHatch', () => {
  beforeEach(() => {
    bakeVectorNodeRotationMock.mockReturnValue({ segments: {}, vertices: {} });
    deriveVectorFacesMock.mockReset();
    drawVectorHatchFillMock.mockClear();
  });

  it('should draw nothing when the node is null', () => {
    // before
    drawShapeBuilderNodeFacesHatch(gl, program, buffer, null, new Set(['k1']), '#0d99ff', 200, 150, IDENTITY_VIEWPORT);

    // result
    expect(drawVectorHatchFillMock).not.toHaveBeenCalled();
  });

  it('should draw nothing when faceKeys is undefined', () => {
    // before
    drawShapeBuilderNodeFacesHatch(gl, program, buffer, node, undefined, '#0d99ff', 200, 150, IDENTITY_VIEWPORT);

    // result
    expect(drawVectorHatchFillMock).not.toHaveBeenCalled();
  });

  it('should hatch-fill every derived face whose key is in faceKeys', () => {
    // mock
    deriveVectorFacesMock.mockReturnValue([
      { key: 'k1', points: [{ x: 0, y: 0 }] },
      { key: 'k2', points: [{ x: 1, y: 1 }] },
    ]);

    // before
    drawShapeBuilderNodeFacesHatch(gl, program, buffer, node, new Set(['k1']), '#0d99ff', 200, 150, IDENTITY_VIEWPORT);

    // result
    expect(drawVectorHatchFillMock).toHaveBeenCalledTimes(1);
    expect(drawVectorHatchFillMock).toHaveBeenCalledWith(gl, program, buffer, [[{ x: 0, y: 0 }]], '#0d99ff', 200, 150, IDENTITY_VIEWPORT);
  });

  it('should bake the node’s rotation into a new segments/vertices set before deriving faces when the node is rotated', () => {
    // mock
    const rotatedNode: TVectorNode = { ...node, rotation: 45 };
    const bakedSegments = { s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null } };
    const bakedVertices = { a: { id: 'a', x: 1, y: 2 } };

    bakeVectorNodeRotationMock.mockReturnValue({ rotation: 0, segments: bakedSegments, vertices: bakedVertices });
    deriveVectorFacesMock.mockReturnValue([]);

    // before
    drawShapeBuilderNodeFacesHatch(gl, program, buffer, rotatedNode, new Set(['k1']), '#0d99ff', 200, 150, IDENTITY_VIEWPORT);

    // result
    expect(bakeVectorNodeRotationMock).toHaveBeenCalledWith(rotatedNode);
    expect(deriveVectorFacesMock).toHaveBeenCalledWith({ ...rotatedNode, rotation: 0, segments: bakedSegments, vertices: bakedVertices });
  });
});
