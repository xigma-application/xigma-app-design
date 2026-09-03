// types
import { NodeType } from 'types/design/enums';
import { TSceneNode, TVectorNode } from 'types/design/types';

// utils
import { createCanvasRefs } from '../../../../useCanvasRefs/createCanvasRefs';
import { drawVectorDraggedFillPreview } from '../drawVectorDraggedFillPreview';

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

describe('drawVectorDraggedFillPreview', () => {
  beforeEach(() => {
    getRenderedVectorNodeMock.mockReset();
    getRenderedVectorNodeMock.mockImplementation((n: TVectorNode) => n);
    deriveVectorFacesMock.mockReset();
    drawVectorHatchFillMock.mockClear();
  });

  it('should draw nothing when nothing is currently being dragged', () => {
    // before
    drawVectorDraggedFillPreview(
      { buffer, canvasHeight: 150, canvasWidth: 200, gl, imageContext: {} as never, program, viewport: IDENTITY_VIEWPORT },
      nodes,
      createCanvasRefs({ vectorSnapshots: { draggedVectorFillFacesRef: { current: null } } }),
    );

    // result
    expect(drawVectorHatchFillMock).not.toHaveBeenCalled();
  });

  it('should skip a node id that no longer resolves to any node, without calling drawVectorHatchFill for it', () => {
    // before
    drawVectorDraggedFillPreview(
      { buffer, canvasHeight: 150, canvasWidth: 200, gl, imageContext: {} as never, program, viewport: IDENTITY_VIEWPORT },
      nodes,
      createCanvasRefs({ vectorSnapshots: { draggedVectorFillFacesRef: { current: { missing: ['k1'] } } } }),
    );

    // result
    expect(drawVectorHatchFillMock).toHaveBeenCalledWith(gl, program, buffer, [], '#cd4422', 200, 150, IDENTITY_VIEWPORT);
  });

  it('should hatch-fill every touched face across every dragged node in one call', () => {
    // mock — two faces on the same node
    deriveVectorFacesMock.mockReturnValue([
      { key: 'k1', points: [{ x: 0, y: 0 }] },
      { key: 'k2', points: [{ x: 1, y: 1 }] },
      { key: 'k3', points: [{ x: 2, y: 2 }] },
    ]);

    // before
    drawVectorDraggedFillPreview(
      { buffer, canvasHeight: 150, canvasWidth: 200, gl, imageContext: {} as never, program, viewport: IDENTITY_VIEWPORT },
      nodes,
      createCanvasRefs({ vectorSnapshots: { draggedVectorFillFacesRef: { current: { [node.id]: ['k1', 'k2'] } } } }),
    );

    // result — only the touched faces (k1, k2), not the untouched k3
    expect(drawVectorHatchFillMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      [[{ x: 0, y: 0 }], [{ x: 1, y: 1 }]],
      '#cd4422',
      200,
      150,
      IDENTITY_VIEWPORT,
    );
  });

  it('should skip a node id that resolves to a non-vector node', () => {
    // mock
    const frameNode = {
      fill: '#ff0000',
      height: 10,
      id: '3',
      name: 'Frame',
      parentId: null,
      rotation: 0,
      childIds: [], clipContent: true, type: NodeType.frame,
      width: 10,
      x: 0,
      y: 0,
    } as TSceneNode;
    const mixedNodes: Record<string, TSceneNode> = { [frameNode.id]: frameNode };

    // before
    drawVectorDraggedFillPreview(
      { buffer, canvasHeight: 150, canvasWidth: 200, gl, imageContext: {} as never, program, viewport: IDENTITY_VIEWPORT },
      mixedNodes,
      createCanvasRefs({ vectorSnapshots: { draggedVectorFillFacesRef: { current: { [frameNode.id]: ['k1'] } } } }),
    );

    // result
    expect(drawVectorHatchFillMock).toHaveBeenCalledWith(gl, program, buffer, [], '#cd4422', 200, 150, IDENTITY_VIEWPORT);
  });

  it('should derive faces from whatever getRenderedVectorNode returns for the dragged node, not the raw node itself', () => {
    // mock
    const rotatedNode: TVectorNode = { ...node, rotation: 45 };
    const rotatedNodes: Record<string, TSceneNode> = { [rotatedNode.id]: rotatedNode };
    const renderedNode: TVectorNode = { ...rotatedNode, rotation: 0 };

    getRenderedVectorNodeMock.mockReturnValue(renderedNode);
    deriveVectorFacesMock.mockReturnValue([]);

    // before
    drawVectorDraggedFillPreview(
      { buffer, canvasHeight: 150, canvasWidth: 200, gl, imageContext: {} as never, program, viewport: IDENTITY_VIEWPORT },
      rotatedNodes,
      createCanvasRefs({ vectorSnapshots: { draggedVectorFillFacesRef: { current: { [rotatedNode.id]: ['k1'] } } } }),
    );

    // result
    expect(getRenderedVectorNodeMock).toHaveBeenCalledWith(rotatedNode);
    expect(deriveVectorFacesMock).toHaveBeenCalledWith(renderedNode);
  });
});
