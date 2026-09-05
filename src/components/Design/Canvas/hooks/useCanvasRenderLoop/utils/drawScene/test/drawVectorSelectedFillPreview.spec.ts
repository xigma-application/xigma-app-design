// types
import { NodeType } from 'types/design/enums';
import { TSceneNode, TVectorNode } from 'types/design/types';

// utils
import { createCanvasRefs } from '../../../../useCanvasRefs/createCanvasRefs';
import { drawVectorSelectedFillPreview } from '../drawVectorSelectedFillPreview';

const getRenderedVectorNodeMock = vi.fn();
const getVectorFullySelectedFacesMock = vi.fn();
const drawVectorHatchFillMock = vi.fn();

vi.mock('utils/canvas/render/getRenderedVectorNode', () => ({
  getRenderedVectorNode: (...args: unknown[]): unknown => getRenderedVectorNodeMock(...args),
}));
vi.mock('utils/canvas/vectorNetwork/getVectorFullySelectedFaces', () => ({
  getVectorFullySelectedFaces: (...args: unknown[]): unknown => getVectorFullySelectedFacesMock(...args),
}));
vi.mock('utils/canvas/drawVectorNode/drawVectorHatchFill', () => ({
  drawVectorHatchFill: (...args: unknown[]): void => drawVectorHatchFillMock(...args),
}));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const gl = {} as WebGL2RenderingContext;
const program = {} as WebGLProgram;
const buffer = {} as WebGLBuffer;

const node: TVectorNode = {
  defaultFill: [{ color: '#000000', opacity: 100, type: 'solid' }],
  filledFaceKeys: ['k1'],
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

const nodes: Record<string, TSceneNode> = { [node.id]: node };

describe('drawVectorSelectedFillPreview', () => {
  beforeEach(() => {
    getRenderedVectorNodeMock.mockReset();
    getRenderedVectorNodeMock.mockImplementation((n: TVectorNode) => n);
    getVectorFullySelectedFacesMock.mockReset();
    drawVectorHatchFillMock.mockClear();
  });

  it('should draw nothing when nothing is selected', () => {
    // before
    drawVectorSelectedFillPreview(
      {
        buffer,
        canvasHeight: 150,
        canvasWidth: 200,
        gl,
        imageContext: { isAlphaWriteEnabled: false } as never,
        program,
        viewport: IDENTITY_VIEWPORT,
      },
      nodes,
      [node.id],
      createCanvasRefs({ vectorEdit: { selectedVectorVertexIdsRef: { current: [] } } }),
    );

    // result
    expect(drawVectorHatchFillMock).not.toHaveBeenCalled();
    expect(getVectorFullySelectedFacesMock).not.toHaveBeenCalled();
  });

  it('should draw nothing when a node id no longer resolves to any node', () => {
    // before
    drawVectorSelectedFillPreview(
      {
        buffer,
        canvasHeight: 150,
        canvasWidth: 200,
        gl,
        imageContext: { isAlphaWriteEnabled: false } as never,
        program,
        viewport: IDENTITY_VIEWPORT,
      },
      nodes,
      ['missing'],
      createCanvasRefs({ vectorEdit: { selectedVectorVertexIdsRef: { current: ['v1'] } } }),
    );

    // result
    expect(drawVectorHatchFillMock).not.toHaveBeenCalled();
  });

  it('should hatch-fill every fully-selected face across every open node in one call', () => {
    // mock
    getVectorFullySelectedFacesMock.mockReturnValue([
      { key: 'k1', points: [{ x: 0, y: 0 }] },
      { key: 'k2', points: [{ x: 1, y: 1 }] },
    ]);

    // before
    drawVectorSelectedFillPreview(
      {
        buffer,
        canvasHeight: 150,
        canvasWidth: 200,
        gl,
        imageContext: { isAlphaWriteEnabled: false } as never,
        program,
        viewport: IDENTITY_VIEWPORT,
      },
      nodes,
      [node.id],
      createCanvasRefs({ vectorEdit: { selectedVectorVertexIdsRef: { current: ['v1', 'v2', 'v3'] } } }),
    );

    // result
    expect(drawVectorHatchFillMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      [[{ x: 0, y: 0 }], [{ x: 1, y: 1 }]],
      '#337ae1',
      200,
      150,
      IDENTITY_VIEWPORT,
      false,
    );
  });

  it('should draw nothing when no open node currently has a fully-selected face', () => {
    // mock
    getVectorFullySelectedFacesMock.mockReturnValue([]);

    // before
    drawVectorSelectedFillPreview(
      {
        buffer,
        canvasHeight: 150,
        canvasWidth: 200,
        gl,
        imageContext: { isAlphaWriteEnabled: false } as never,
        program,
        viewport: IDENTITY_VIEWPORT,
      },
      nodes,
      [node.id],
      createCanvasRefs({ vectorEdit: { selectedVectorVertexIdsRef: { current: ['v1'] } } }),
    );

    // result
    expect(drawVectorHatchFillMock).not.toHaveBeenCalled();
  });

  it('should draw nothing when a node id resolves to a non-vector node', () => {
    // mock
    const frameNode = {
      childIds: [],
      clipContent: true,
      fill: '#ff0000',
      height: 10,
      id: '3',
      name: 'Frame',
      parentId: null,
      rotation: 0,
      type: NodeType.frame,
      width: 10,
      x: 0,
      y: 0,
    } as TSceneNode;
    const mixedNodes: Record<string, TSceneNode> = { [frameNode.id]: frameNode };

    // before
    drawVectorSelectedFillPreview(
      {
        buffer,
        canvasHeight: 150,
        canvasWidth: 200,
        gl,
        imageContext: { isAlphaWriteEnabled: false } as never,
        program,
        viewport: IDENTITY_VIEWPORT,
      },
      mixedNodes,
      [frameNode.id],
      createCanvasRefs({ vectorEdit: { selectedVectorVertexIdsRef: { current: ['v1'] } } }),
    );

    // result
    expect(drawVectorHatchFillMock).not.toHaveBeenCalled();
    expect(getVectorFullySelectedFacesMock).not.toHaveBeenCalled();
  });

  it('should resolve fully-selected faces from whatever getRenderedVectorNode returns for the open node, not the raw node itself', () => {
    // mock
    const rotatedNode: TVectorNode = { ...node, rotation: 45 };
    const rotatedNodes: Record<string, TSceneNode> = { [rotatedNode.id]: rotatedNode };
    const renderedNode: TVectorNode = { ...rotatedNode, rotation: 0 };

    getRenderedVectorNodeMock.mockReturnValue(renderedNode);
    getVectorFullySelectedFacesMock.mockReturnValue([]);

    // before
    drawVectorSelectedFillPreview(
      {
        buffer,
        canvasHeight: 150,
        canvasWidth: 200,
        gl,
        imageContext: { isAlphaWriteEnabled: false } as never,
        program,
        viewport: IDENTITY_VIEWPORT,
      },
      rotatedNodes,
      [rotatedNode.id],
      createCanvasRefs({ vectorEdit: { selectedVectorVertexIdsRef: { current: ['v1'] } } }),
    );

    // result
    expect(getRenderedVectorNodeMock).toHaveBeenCalledWith(rotatedNode);
    expect(getVectorFullySelectedFacesMock).toHaveBeenCalledWith(renderedNode, ['v1']);
  });
});
