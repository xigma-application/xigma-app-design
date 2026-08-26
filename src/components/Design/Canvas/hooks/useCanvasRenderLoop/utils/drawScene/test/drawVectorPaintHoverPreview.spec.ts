// types
import { NodeType } from 'types/design/enums';
import { TSceneNode, TVectorNode } from 'types/design/types';

// utils
import { drawVectorPaintHoverPreview } from '../drawVectorPaintHoverPreview';

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
    bakeVectorNodeRotationMock.mockReturnValue({ segments: {}, vertices: {} });
    deriveVectorFacesMock.mockReset();
    drawVectorHatchFillMock.mockClear();
  });

  it('should draw nothing when nothing is hovered', () => {
    // before
    drawVectorPaintHoverPreview(gl, program, buffer, nodes, null, 200, 150, IDENTITY_VIEWPORT);

    // result
    expect(drawVectorHatchFillMock).not.toHaveBeenCalled();
  });

  it('should draw nothing when the hovered node id no longer resolves to any node', () => {
    // before
    drawVectorPaintHoverPreview(
      gl,
      program,
      buffer,
      nodes,
      { faceKey: 'k1', isFilled: true, nodeId: 'missing' },
      200,
      150,
      IDENTITY_VIEWPORT,
    );

    // result
    expect(drawVectorHatchFillMock).not.toHaveBeenCalled();
  });

  it('should draw nothing when the hovered face key no longer matches any current face (e.g. its segments were deleted)', () => {
    // mock
    deriveVectorFacesMock.mockReturnValue([]);

    // before
    drawVectorPaintHoverPreview(
      gl,
      program,
      buffer,
      nodes,
      { faceKey: 'stale-key', isFilled: true, nodeId: node.id },
      200,
      150,
      IDENTITY_VIEWPORT,
    );

    // result
    expect(drawVectorHatchFillMock).not.toHaveBeenCalled();
  });

  it('should hatch-fill the hovered face with the remove color when it is already filled', () => {
    // mock
    deriveVectorFacesMock.mockReturnValue([{ key: 'k1', points: [{ x: 0, y: 0 }] }]);

    // before
    drawVectorPaintHoverPreview(
      gl,
      program,
      buffer,
      nodes,
      { faceKey: 'k1', isFilled: true, nodeId: node.id },
      200,
      150,
      IDENTITY_VIEWPORT,
    );

    // result
    expect(drawVectorHatchFillMock).toHaveBeenCalledWith(gl, program, buffer, [[{ x: 0, y: 0 }]], '#cd4422', 200, 150, IDENTITY_VIEWPORT);
  });

  it('should hatch-fill the hovered face with the add color when it is not yet filled', () => {
    // mock
    const unfilledNode: TVectorNode = { ...node, filledFaceKeys: [], id: '2' };
    const unfilledNodes: Record<string, TSceneNode> = { [unfilledNode.id]: unfilledNode };

    deriveVectorFacesMock.mockReturnValue([{ key: 'k2', points: [{ x: 1, y: 1 }] }]);

    // before
    drawVectorPaintHoverPreview(
      gl,
      program,
      buffer,
      unfilledNodes,
      { faceKey: 'k2', isFilled: false, nodeId: unfilledNode.id },
      200,
      150,
      IDENTITY_VIEWPORT,
    );

    // result
    expect(drawVectorHatchFillMock).toHaveBeenCalledWith(gl, program, buffer, [[{ x: 1, y: 1 }]], '#0d99ff', 200, 150, IDENTITY_VIEWPORT);
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
    drawVectorPaintHoverPreview(
      gl,
      program,
      buffer,
      mixedNodes,
      { faceKey: 'k1', isFilled: true, nodeId: frameNode.id },
      200,
      150,
      IDENTITY_VIEWPORT,
    );

    // result
    expect(drawVectorHatchFillMock).not.toHaveBeenCalled();
  });

  it('should bake the node’s rotation into a new segments/vertices set before deriving faces when the hovered node is rotated', () => {
    // mock
    const rotatedNode: TVectorNode = { ...node, rotation: 45 };
    const rotatedNodes: Record<string, TSceneNode> = { [rotatedNode.id]: rotatedNode };
    const bakedSegments = { s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null } };
    const bakedVertices = { a: { id: 'a', x: 1, y: 2 } };

    bakeVectorNodeRotationMock.mockReturnValue({ rotation: 0, segments: bakedSegments, vertices: bakedVertices });
    deriveVectorFacesMock.mockReturnValue([]);

    // before
    drawVectorPaintHoverPreview(
      gl,
      program,
      buffer,
      rotatedNodes,
      { faceKey: 'k1', isFilled: true, nodeId: rotatedNode.id },
      200,
      150,
      IDENTITY_VIEWPORT,
    );

    // result
    expect(bakeVectorNodeRotationMock).toHaveBeenCalledWith(rotatedNode);
    expect(deriveVectorFacesMock).toHaveBeenCalledWith({ ...rotatedNode, rotation: 0, segments: bakedSegments, vertices: bakedVertices });
  });
});
