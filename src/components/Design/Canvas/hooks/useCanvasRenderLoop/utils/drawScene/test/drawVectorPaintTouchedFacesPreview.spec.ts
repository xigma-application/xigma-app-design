// types
import { NodeType } from 'types/design/enums';
import { TCanvasRefs, TVectorDraggedFillFaces } from 'types/design/canvas/types';
import { TSceneNode, TVectorNode } from 'types/design/types';

// utils
import { createCanvasRefs } from '../../../../useCanvasRefs/createCanvasRefs';
import { drawVectorPaintTouchedFacesPreview } from '../drawVectorPaintTouchedFacesPreview';

const refsFor = (touchedFaces: TVectorDraggedFillFaces | null, isRemoveMode: boolean): TCanvasRefs =>
  createCanvasRefs({
    vectorPaint: {
      isVectorPaintRemoveRef: { current: isRemoveMode },
      vectorPaintTouchedFacesRef: { current: touchedFaces },
    },
  });

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

describe('drawVectorPaintTouchedFacesPreview', () => {
  beforeEach(() => {
    getRenderedVectorNodeMock.mockReset();
    getRenderedVectorNodeMock.mockImplementation((n: TVectorNode) => n);
    deriveVectorFacesMock.mockReset();
    drawVectorHatchFillMock.mockClear();
  });

  it('should draw nothing while no paint stroke is in progress', () => {
    // before
    drawVectorPaintTouchedFacesPreview(
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
      refsFor(null, false),
    );

    // result
    expect(drawVectorHatchFillMock).not.toHaveBeenCalled();
  });

  it('should skip a node id that no longer resolves to any node, without calling drawVectorHatchFill for it', () => {
    // before
    drawVectorPaintTouchedFacesPreview(
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
      refsFor({ missing: ['k1'] }, false),
    );

    // result
    expect(drawVectorHatchFillMock).toHaveBeenCalledWith(gl, program, buffer, [], '#337ae1', 200, 150, IDENTITY_VIEWPORT, false);
  });

  it('should hatch-fill every face the stroke has touched so far across every open node in one call, in the add color while adding fill', () => {
    // mock — two faces on the same node
    deriveVectorFacesMock.mockReturnValue([
      { key: 'k1', points: [{ x: 0, y: 0 }] },
      { key: 'k2', points: [{ x: 1, y: 1 }] },
      { key: 'k3', points: [{ x: 2, y: 2 }] },
    ]);

    // before
    drawVectorPaintTouchedFacesPreview(
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
      refsFor({ [node.id]: ['k1', 'k2'] }, false),
    );

    // result — only the touched faces (k1, k2), not the untouched k3
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

  it('should hatch-fill the touched faces in the remove color while destroying fill', () => {
    // mock
    deriveVectorFacesMock.mockReturnValue([{ key: 'k1', points: [{ x: 0, y: 0 }] }]);

    // before
    drawVectorPaintTouchedFacesPreview(
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
      refsFor({ [node.id]: ['k1'] }, true),
    );

    // result
    expect(drawVectorHatchFillMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      [[{ x: 0, y: 0 }]],
      '#cd4422',
      200,
      150,
      IDENTITY_VIEWPORT,
      false,
    );
  });

  it('should skip a node id that resolves to a non-vector node', () => {
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
    drawVectorPaintTouchedFacesPreview(
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
      refsFor({ [frameNode.id]: ['k1'] }, false),
    );

    // result
    expect(drawVectorHatchFillMock).toHaveBeenCalledWith(gl, program, buffer, [], '#337ae1', 200, 150, IDENTITY_VIEWPORT, false);
  });

  it('should derive faces from whatever getRenderedVectorNode returns for the touched node, not the raw node itself', () => {
    // mock
    const rotatedNode: TVectorNode = { ...node, rotation: 45 };
    const rotatedNodes: Record<string, TSceneNode> = { [rotatedNode.id]: rotatedNode };
    const renderedNode: TVectorNode = { ...rotatedNode, rotation: 0 };

    getRenderedVectorNodeMock.mockReturnValue(renderedNode);
    deriveVectorFacesMock.mockReturnValue([]);

    // before
    drawVectorPaintTouchedFacesPreview(
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
      refsFor({ [rotatedNode.id]: ['k1'] }, false),
    );

    // result
    expect(getRenderedVectorNodeMock).toHaveBeenCalledWith(rotatedNode);
    expect(deriveVectorFacesMock).toHaveBeenCalledWith(renderedNode);
  });
});
