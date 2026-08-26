// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';
import { TVectorNodeDragSnapshot } from 'types/design/canvas/types';

// utils
import { drawSceneVectorNode } from '../drawSceneVectorNode';

const drawVectorNodeMock = vi.fn();
const drawVectorNodeDragSnapshotMock = vi.fn();

vi.mock('utils/canvas/drawVectorNode/drawVectorNode', () => ({ drawVectorNode: (...args: unknown[]): void => drawVectorNodeMock(...args) }));
vi.mock('utils/canvas/drawVectorNode/drawVectorNodeDragSnapshot', () => ({
  drawVectorNodeDragSnapshot: (...args: unknown[]): void => drawVectorNodeDragSnapshotMock(...args),
}));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

const node: TVectorNode = {
  fillColor: null,
  filledFaceKeys: [],
  id: 'node-1',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments: {},
  strokeColor: '#00ff00',
  strokeWidth: 2,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: {},
};

describe('drawSceneVectorNode', () => {
  beforeEach(() => {
    drawVectorNodeMock.mockClear();
    drawVectorNodeDragSnapshotMock.mockClear();
  });

  it('should draw the node normally when there is no dragged-node snapshot map at all', () => {
    // mock
    const gl = {} as WebGL2RenderingContext;
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawSceneVectorNode(gl, program, buffer, node, null, 200, 150, IDENTITY_VIEWPORT);

    // result
    expect(drawVectorNodeMock).toHaveBeenCalledWith(gl, program, buffer, node, 200, 150, IDENTITY_VIEWPORT);
    expect(drawVectorNodeDragSnapshotMock).not.toHaveBeenCalled();
  });

  it('should draw the node normally when the snapshot map exists but has no entry for this node', () => {
    // mock
    const gl = {} as WebGL2RenderingContext;
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const snapshots = new Map<string, TVectorNodeDragSnapshot>();

    // before
    drawSceneVectorNode(gl, program, buffer, node, snapshots, 200, 150, IDENTITY_VIEWPORT);

    // result
    expect(drawVectorNodeMock).toHaveBeenCalledWith(gl, program, buffer, node, 200, 150, IDENTITY_VIEWPORT);
    expect(drawVectorNodeDragSnapshotMock).not.toHaveBeenCalled();
  });

  it('should draw the frozen drag snapshot instead of the live node when one exists for this node’s id', () => {
    // mock
    const gl = {} as WebGL2RenderingContext;
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const snapshot: TVectorNodeDragSnapshot = { deltaX: 5, deltaY: 10, facesByColor: [], strokeColor: '#00ff00', strokeVertices: [] };
    const snapshots = new Map([['node-1', snapshot]]);

    // before
    drawSceneVectorNode(gl, program, buffer, node, snapshots, 200, 150, IDENTITY_VIEWPORT);

    // result
    expect(drawVectorNodeDragSnapshotMock).toHaveBeenCalledWith(gl, program, buffer, snapshot, 200, 150, IDENTITY_VIEWPORT);
    expect(drawVectorNodeMock).not.toHaveBeenCalled();
  });
});
