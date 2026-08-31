// types
import { NodeType } from 'types/design/enums';
import { TSceneNode, TVectorNode } from 'types/design/types';

// utils
import { createCanvasRefs } from '../../../../useCanvasRefs/createCanvasRefs';
import { drawVectorFaceSelectHoverPreview } from '../drawVectorFaceSelectHoverPreview';

const getRenderedVectorNodeMock = vi.fn();
const deriveVectorFacesMock = vi.fn();
const drawVectorHatchFillMock = vi.fn();

vi.mock('components/Design/Canvas/utils/getRenderedVectorNode', () => ({
  getRenderedVectorNode: (...args: unknown[]): unknown => getRenderedVectorNodeMock(...args),
}));
vi.mock('utils/canvas/vectorNetwork/deriveVectorFaces/deriveVectorFaces', () => ({
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

describe('drawVectorFaceSelectHoverPreview', () => {
  beforeEach(() => {
    getRenderedVectorNodeMock.mockReset();
    getRenderedVectorNodeMock.mockImplementation((n: TVectorNode) => n);
    deriveVectorFacesMock.mockReset();
    drawVectorHatchFillMock.mockClear();
  });

  it('should draw nothing when nothing is hovered', () => {
    // before
    drawVectorFaceSelectHoverPreview(gl, program, buffer, nodes, createCanvasRefs(), 200, 150, IDENTITY_VIEWPORT);

    // result
    expect(drawVectorHatchFillMock).not.toHaveBeenCalled();
  });

  it('should draw nothing when the hovered node id no longer resolves to any node', () => {
    // before
    drawVectorFaceSelectHoverPreview(
      gl,
      program,
      buffer,
      nodes,
      createCanvasRefs({ hover: { hoveredVectorFaceSelectRef: { current: { faceKey: 'k1', nodeId: 'missing' } } } }),
      200,
      150,
      IDENTITY_VIEWPORT,
    );

    // result
    expect(drawVectorHatchFillMock).not.toHaveBeenCalled();
  });

  it('should draw nothing when the hovered face key no longer matches any current face', () => {
    // mock
    deriveVectorFacesMock.mockReturnValue([]);

    // before
    drawVectorFaceSelectHoverPreview(
      gl,
      program,
      buffer,
      nodes,
      createCanvasRefs({ hover: { hoveredVectorFaceSelectRef: { current: { faceKey: 'stale-key', nodeId: node.id } } } }),
      200,
      150,
      IDENTITY_VIEWPORT,
    );

    // result
    expect(drawVectorHatchFillMock).not.toHaveBeenCalled();
  });

  it('should hatch-fill the hovered face with the same blue used by the Paint tool hover-add preview', () => {
    // mock
    deriveVectorFacesMock.mockReturnValue([{ key: 'k1', points: [{ x: 0, y: 0 }] }]);

    // before
    drawVectorFaceSelectHoverPreview(
      gl,
      program,
      buffer,
      nodes,
      createCanvasRefs({ hover: { hoveredVectorFaceSelectRef: { current: { faceKey: 'k1', nodeId: node.id } } } }),
      200,
      150,
      IDENTITY_VIEWPORT,
    );

    // result
    expect(drawVectorHatchFillMock).toHaveBeenCalledWith(gl, program, buffer, [[{ x: 0, y: 0 }]], '#337ae1', 200, 150, IDENTITY_VIEWPORT);
  });

  it('should draw nothing when the hovered node id resolves to a non-vector node', () => {
    // mock
    const frameNode = {
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
    drawVectorFaceSelectHoverPreview(
      gl,
      program,
      buffer,
      mixedNodes,
      createCanvasRefs({ hover: { hoveredVectorFaceSelectRef: { current: { faceKey: 'k1', nodeId: frameNode.id } } } }),
      200,
      150,
      IDENTITY_VIEWPORT,
    );

    // result
    expect(drawVectorHatchFillMock).not.toHaveBeenCalled();
  });

  it('should derive faces from whatever getRenderedVectorNode returns for the hovered node, not the raw node itself', () => {
    // mock
    const rotatedNode: TVectorNode = { ...node, rotation: 45 };
    const rotatedNodes: Record<string, TSceneNode> = { [rotatedNode.id]: rotatedNode };
    const renderedNode: TVectorNode = { ...rotatedNode, rotation: 0 };

    getRenderedVectorNodeMock.mockReturnValue(renderedNode);
    deriveVectorFacesMock.mockReturnValue([]);

    // before
    drawVectorFaceSelectHoverPreview(
      gl,
      program,
      buffer,
      rotatedNodes,
      createCanvasRefs({ hover: { hoveredVectorFaceSelectRef: { current: { faceKey: 'k1', nodeId: rotatedNode.id } } } }),
      200,
      150,
      IDENTITY_VIEWPORT,
    );

    // result
    expect(getRenderedVectorNodeMock).toHaveBeenCalledWith(rotatedNode);
    expect(deriveVectorFacesMock).toHaveBeenCalledWith(renderedNode);
  });
});
