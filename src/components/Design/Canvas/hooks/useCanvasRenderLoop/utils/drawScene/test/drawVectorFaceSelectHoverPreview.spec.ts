// types
import { NodeType } from 'types/design/enums';
import { TSceneNode, TVectorNode } from 'types/design/types';

// utils
import { drawVectorFaceSelectHoverPreview } from '../drawVectorFaceSelectHoverPreview';

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

describe('drawVectorFaceSelectHoverPreview', () => {
  beforeEach(() => {
    bakeVectorNodeRotationMock.mockReturnValue({ segments: {}, vertices: {} });
    deriveVectorFacesMock.mockReset();
    drawVectorHatchFillMock.mockClear();
  });

  it('should draw nothing when nothing is hovered', () => {
    // before
    drawVectorFaceSelectHoverPreview(gl, program, buffer, nodes, null, 200, 150, IDENTITY_VIEWPORT);

    // result
    expect(drawVectorHatchFillMock).not.toHaveBeenCalled();
  });

  it('should draw nothing when the hovered node id no longer resolves to any node', () => {
    // before
    drawVectorFaceSelectHoverPreview(gl, program, buffer, nodes, { faceKey: 'k1', nodeId: 'missing' }, 200, 150, IDENTITY_VIEWPORT);

    // result
    expect(drawVectorHatchFillMock).not.toHaveBeenCalled();
  });

  it('should draw nothing when the hovered face key no longer matches any current face', () => {
    // mock
    deriveVectorFacesMock.mockReturnValue([]);

    // before
    drawVectorFaceSelectHoverPreview(gl, program, buffer, nodes, { faceKey: 'stale-key', nodeId: node.id }, 200, 150, IDENTITY_VIEWPORT);

    // result
    expect(drawVectorHatchFillMock).not.toHaveBeenCalled();
  });

  it('should hatch-fill the hovered face with the same blue used by the Paint tool hover-add preview', () => {
    // mock
    deriveVectorFacesMock.mockReturnValue([{ key: 'k1', points: [{ x: 0, y: 0 }] }]);

    // before
    drawVectorFaceSelectHoverPreview(gl, program, buffer, nodes, { faceKey: 'k1', nodeId: node.id }, 200, 150, IDENTITY_VIEWPORT);

    // result
    expect(drawVectorHatchFillMock).toHaveBeenCalledWith(gl, program, buffer, [[{ x: 0, y: 0 }]], '#0d99ff', 200, 150, IDENTITY_VIEWPORT);
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
    drawVectorFaceSelectHoverPreview(gl, program, buffer, mixedNodes, { faceKey: 'k1', nodeId: frameNode.id }, 200, 150, IDENTITY_VIEWPORT);

    // result
    expect(drawVectorHatchFillMock).not.toHaveBeenCalled();
  });
});
