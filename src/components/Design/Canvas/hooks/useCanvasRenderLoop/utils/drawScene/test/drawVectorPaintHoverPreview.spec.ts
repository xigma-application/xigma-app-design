// types
import { NodeType } from 'types/design/enums';
import { TSceneNode, TVectorNode } from 'types/design/types';

// utils
import { createCanvasRefs } from '../../../../useCanvasRefs/createCanvasRefs';
import { drawVectorPaintHoverPreview } from '../drawVectorPaintHoverPreview';

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

describe('drawVectorPaintHoverPreview', () => {
  beforeEach(() => {
    getRenderedVectorNodeMock.mockReset();
    getRenderedVectorNodeMock.mockImplementation((n: TVectorNode) => n);
    deriveVectorFacesMock.mockReset();
    drawVectorHatchFillMock.mockClear();
  });

  it('should draw nothing when nothing is hovered', () => {
    // before
    drawVectorPaintHoverPreview(
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
      createCanvasRefs(),
    );

    // result
    expect(drawVectorHatchFillMock).not.toHaveBeenCalled();
  });

  it('should draw nothing when the hovered node id no longer resolves to any node', () => {
    // before
    drawVectorPaintHoverPreview(
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
      createCanvasRefs({ hover: { hoveredVectorPaintFaceKeyRef: { current: { faceKey: 'k1', isFilled: true, nodeId: 'missing' } } } }),
    );

    // result
    expect(drawVectorHatchFillMock).not.toHaveBeenCalled();
  });

  it('should draw nothing when the hovered face key no longer matches any current face (e.g. its segments were deleted)', () => {
    // mock
    deriveVectorFacesMock.mockReturnValue([]);

    // before
    drawVectorPaintHoverPreview(
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
      createCanvasRefs({ hover: { hoveredVectorPaintFaceKeyRef: { current: { faceKey: 'stale-key', isFilled: true, nodeId: node.id } } } }),
    );

    // result
    expect(drawVectorHatchFillMock).not.toHaveBeenCalled();
  });

  it('should hatch-fill the hovered face with the remove color when it is already filled', () => {
    // mock
    deriveVectorFacesMock.mockReturnValue([{ key: 'k1', points: [{ x: 0, y: 0 }] }]);

    // before
    drawVectorPaintHoverPreview(
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
      createCanvasRefs({ hover: { hoveredVectorPaintFaceKeyRef: { current: { faceKey: 'k1', isFilled: true, nodeId: node.id } } } }),
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

  it('should hatch-fill the hovered face with the add color when it is not yet filled', () => {
    // mock
    const unfilledNode: TVectorNode = { ...node, filledFaceKeys: [], id: '2' };
    const unfilledNodes: Record<string, TSceneNode> = { [unfilledNode.id]: unfilledNode };

    deriveVectorFacesMock.mockReturnValue([{ key: 'k2', points: [{ x: 1, y: 1 }] }]);

    // before
    drawVectorPaintHoverPreview(
      {
        buffer,
        canvasHeight: 150,
        canvasWidth: 200,
        gl,
        imageContext: { isAlphaWriteEnabled: false } as never,
        program,
        viewport: IDENTITY_VIEWPORT,
      },
      unfilledNodes,
      createCanvasRefs({
        hover: { hoveredVectorPaintFaceKeyRef: { current: { faceKey: 'k2', isFilled: false, nodeId: unfilledNode.id } } },
      }),
    );

    // result
    expect(drawVectorHatchFillMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      [[{ x: 1, y: 1 }]],
      '#337ae1',
      200,
      150,
      IDENTITY_VIEWPORT,
      false,
    );
  });

  it('should draw nothing when the hovered node id resolves to a non-vector node', () => {
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
    drawVectorPaintHoverPreview(
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
      createCanvasRefs({
        hover: { hoveredVectorPaintFaceKeyRef: { current: { faceKey: 'k1', isFilled: true, nodeId: frameNode.id } } },
      }),
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
    drawVectorPaintHoverPreview(
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
      createCanvasRefs({
        hover: { hoveredVectorPaintFaceKeyRef: { current: { faceKey: 'k1', isFilled: true, nodeId: rotatedNode.id } } },
      }),
    );

    // result
    expect(getRenderedVectorNodeMock).toHaveBeenCalledWith(rotatedNode);
    expect(deriveVectorFacesMock).toHaveBeenCalledWith(renderedNode);
  });
});
