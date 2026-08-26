// types
import { NodeType } from 'types/design/enums';
import { TSceneNode, TVectorNode } from 'types/design/types';

// utils
import { drawVectorSelectedFillPreview } from '../drawVectorSelectedFillPreview';

const bakeVectorNodeRotationMock = vi.fn();
const getVectorFullySelectedFacesMock = vi.fn();
const drawVectorHatchFillMock = vi.fn();

vi.mock('components/Design/Canvas/utils/bakeVectorNodeRotation', () => ({
  bakeVectorNodeRotation: (...args: unknown[]): unknown => bakeVectorNodeRotationMock(...args),
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

describe('drawVectorSelectedFillPreview', () => {
  beforeEach(() => {
    bakeVectorNodeRotationMock.mockReturnValue({ segments: {}, vertices: {} });
    getVectorFullySelectedFacesMock.mockReset();
    drawVectorHatchFillMock.mockClear();
  });

  it('should draw nothing when nothing is selected', () => {
    // before
    drawVectorSelectedFillPreview(gl, program, buffer, nodes, [node.id], [], 200, 150, IDENTITY_VIEWPORT);

    // result
    expect(drawVectorHatchFillMock).not.toHaveBeenCalled();
    expect(getVectorFullySelectedFacesMock).not.toHaveBeenCalled();
  });

  it('should draw nothing when a node id no longer resolves to any node', () => {
    // before
    drawVectorSelectedFillPreview(gl, program, buffer, nodes, ['missing'], ['v1'], 200, 150, IDENTITY_VIEWPORT);

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
    drawVectorSelectedFillPreview(gl, program, buffer, nodes, [node.id], ['v1', 'v2', 'v3'], 200, 150, IDENTITY_VIEWPORT);

    // result
    expect(drawVectorHatchFillMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      [[{ x: 0, y: 0 }], [{ x: 1, y: 1 }]],
      '#0d99ff',
      200,
      150,
      IDENTITY_VIEWPORT,
    );
  });

  it('should draw nothing when no open node currently has a fully-selected face', () => {
    // mock
    getVectorFullySelectedFacesMock.mockReturnValue([]);

    // before
    drawVectorSelectedFillPreview(gl, program, buffer, nodes, [node.id], ['v1'], 200, 150, IDENTITY_VIEWPORT);

    // result
    expect(drawVectorHatchFillMock).not.toHaveBeenCalled();
  });

  it('should draw nothing when a node id resolves to a non-vector node', () => {
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
    drawVectorSelectedFillPreview(gl, program, buffer, mixedNodes, [frameNode.id], ['v1'], 200, 150, IDENTITY_VIEWPORT);

    // result
    expect(drawVectorHatchFillMock).not.toHaveBeenCalled();
    expect(getVectorFullySelectedFacesMock).not.toHaveBeenCalled();
  });

  it('should bake the node’s rotation into a new segments/vertices set before deriving faces when the open node is rotated', () => {
    // mock
    const rotatedNode: TVectorNode = { ...node, rotation: 45 };
    const rotatedNodes: Record<string, TSceneNode> = { [rotatedNode.id]: rotatedNode };
    const bakedSegments = { s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null } };
    const bakedVertices = { a: { id: 'a', x: 1, y: 2 } };

    bakeVectorNodeRotationMock.mockReturnValue({ rotation: 0, segments: bakedSegments, vertices: bakedVertices });
    getVectorFullySelectedFacesMock.mockReturnValue([]);

    // before
    drawVectorSelectedFillPreview(gl, program, buffer, rotatedNodes, [rotatedNode.id], ['v1'], 200, 150, IDENTITY_VIEWPORT);

    // result
    expect(bakeVectorNodeRotationMock).toHaveBeenCalledWith(rotatedNode);
    expect(getVectorFullySelectedFacesMock).toHaveBeenCalledWith(
      { ...rotatedNode, rotation: 0, segments: bakedSegments, vertices: bakedVertices },
      ['v1'],
    );
  });
});
