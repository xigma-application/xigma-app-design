// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { drawShapeBuilderNodeFacesHatch } from '../drawShapeBuilderNodeFacesHatch';

const getRenderedVectorNodeMock = vi.fn();
const deriveVectorFacesMock = vi.fn();
const drawVectorHatchFillMock = vi.fn();

vi.mock('utils/canvas/render/getRenderedVectorNode', () => ({
  getRenderedVectorNode: (...args: unknown[]): unknown => getRenderedVectorNodeMock(...args),
}));
vi.mock('utils/canvas/vectorNetwork/deriveVectorFaces/deriveVectorFaces', () => ({
  deriveVectorFaces: (...args: unknown[]): unknown => deriveVectorFacesMock(...args),
}));
vi.mock('utils/canvas/drawVectorNode/drawVectorHatchFill', () => ({
  drawVectorHatchFill: (...args: unknown[]): void => drawVectorHatchFillMock(...args),
}));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const IS_ALPHA_WRITE_ENABLED = false;
const gl = {} as WebGL2RenderingContext;
const program = {} as WebGLProgram;
const buffer = {} as WebGLBuffer;

const node: TVectorNode = {
  defaultFill: [{ color: '#000000', opacity: 100, type: 'solid' }],
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
    getRenderedVectorNodeMock.mockReset();
    getRenderedVectorNodeMock.mockImplementation((n: TVectorNode) => n);
    deriveVectorFacesMock.mockReset();
    drawVectorHatchFillMock.mockClear();
  });

  it('should draw nothing when the node is null', () => {
    // before
    drawShapeBuilderNodeFacesHatch(
      gl,
      program,
      buffer,
      null,
      new Set(['k1']),
      '#337ae1',
      200,
      150,
      IDENTITY_VIEWPORT,
      IS_ALPHA_WRITE_ENABLED,
    );

    // result
    expect(drawVectorHatchFillMock).not.toHaveBeenCalled();
  });

  it('should draw nothing when faceKeys is undefined', () => {
    // before
    drawShapeBuilderNodeFacesHatch(gl, program, buffer, node, undefined, '#337ae1', 200, 150, IDENTITY_VIEWPORT, IS_ALPHA_WRITE_ENABLED);

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
    drawShapeBuilderNodeFacesHatch(
      gl,
      program,
      buffer,
      node,
      new Set(['k1']),
      '#337ae1',
      200,
      150,
      IDENTITY_VIEWPORT,
      IS_ALPHA_WRITE_ENABLED,
    );

    // result
    expect(drawVectorHatchFillMock).toHaveBeenCalledTimes(1);
    expect(drawVectorHatchFillMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      [[{ x: 0, y: 0 }]],
      '#337ae1',
      200,
      150,
      IDENTITY_VIEWPORT,
      IS_ALPHA_WRITE_ENABLED,
    );
  });

  it('should derive faces from whatever getRenderedVectorNode returns for the node, not the raw node itself', () => {
    // mock
    const rotatedNode: TVectorNode = { ...node, rotation: 45 };
    const renderedNode: TVectorNode = { ...rotatedNode, rotation: 0 };

    getRenderedVectorNodeMock.mockReturnValue(renderedNode);
    deriveVectorFacesMock.mockReturnValue([]);

    // before
    drawShapeBuilderNodeFacesHatch(
      gl,
      program,
      buffer,
      rotatedNode,
      new Set(['k1']),
      '#337ae1',
      200,
      150,
      IDENTITY_VIEWPORT,
      IS_ALPHA_WRITE_ENABLED,
    );

    // result
    expect(getRenderedVectorNodeMock).toHaveBeenCalledWith(rotatedNode);
    expect(deriveVectorFacesMock).toHaveBeenCalledWith(renderedNode);
  });
});
