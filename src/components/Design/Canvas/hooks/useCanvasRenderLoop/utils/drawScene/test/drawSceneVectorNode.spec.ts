// types
import { NodeType } from 'types/design/enums';
import { TPoint } from 'types/canvas';
import { TVectorNode } from 'types/design/types';
import { TVectorNodeDragSnapshot, TVectorNodeResizeSnapshot, TVectorNodeRotateSnapshot } from 'types/design/canvas/types';

// utils
import { drawSceneVectorNode } from '../drawSceneVectorNode';

const drawVectorNodeMock = vi.fn();
const drawVectorNodeDragSnapshotMock = vi.fn();
const drawVectorNodeResizeSnapshotMock = vi.fn();
const drawVectorNodeRotateSnapshotMock = vi.fn();

vi.mock('utils/canvas/drawVectorNode/drawVectorNode', () => ({
  drawVectorNode: (...args: unknown[]): void => drawVectorNodeMock(...args),
}));
vi.mock('utils/canvas/drawVectorNode/drawVectorNodeDragSnapshot', () => ({
  drawVectorNodeDragSnapshot: (...args: unknown[]): void => drawVectorNodeDragSnapshotMock(...args),
}));
vi.mock('utils/canvas/drawVectorNode/drawVectorNodeResizeSnapshot', () => ({
  drawVectorNodeResizeSnapshot: (...args: unknown[]): void => drawVectorNodeResizeSnapshotMock(...args),
}));
vi.mock('utils/canvas/drawVectorNode/drawVectorNodeRotateSnapshot', () => ({
  drawVectorNodeRotateSnapshot: (...args: unknown[]): void => drawVectorNodeRotateSnapshotMock(...args),
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
    drawVectorNodeResizeSnapshotMock.mockClear();
    drawVectorNodeRotateSnapshotMock.mockClear();
  });

  it('should draw the node normally when there is no snapshot map at all', () => {
    // mock
    const gl = {} as WebGL2RenderingContext;
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const faceBufferCache = new WeakMap<TPoint[], WebGLBuffer>();

    // before
    drawSceneVectorNode(gl, program, buffer, faceBufferCache, node, null, null, null, 200, 150, IDENTITY_VIEWPORT);

    // result
    expect(drawVectorNodeMock).toHaveBeenCalledWith(gl, program, buffer, faceBufferCache, node, 200, 150, IDENTITY_VIEWPORT);
    expect(drawVectorNodeDragSnapshotMock).not.toHaveBeenCalled();
    expect(drawVectorNodeResizeSnapshotMock).not.toHaveBeenCalled();
    expect(drawVectorNodeRotateSnapshotMock).not.toHaveBeenCalled();
  });

  it('should draw the node normally when the snapshot maps exist but have no entry for this node', () => {
    // mock
    const gl = {} as WebGL2RenderingContext;
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const faceBufferCache = new WeakMap<TPoint[], WebGLBuffer>();
    const dragSnapshots = new Map<string, TVectorNodeDragSnapshot>();
    const resizeSnapshots = new Map<string, TVectorNodeResizeSnapshot>();
    const rotateSnapshots = new Map<string, TVectorNodeRotateSnapshot>();

    // before
    drawSceneVectorNode(
      gl,
      program,
      buffer,
      faceBufferCache,
      node,
      dragSnapshots,
      resizeSnapshots,
      rotateSnapshots,
      200,
      150,
      IDENTITY_VIEWPORT,
    );

    // result
    expect(drawVectorNodeMock).toHaveBeenCalledWith(gl, program, buffer, faceBufferCache, node, 200, 150, IDENTITY_VIEWPORT);
    expect(drawVectorNodeDragSnapshotMock).not.toHaveBeenCalled();
    expect(drawVectorNodeResizeSnapshotMock).not.toHaveBeenCalled();
    expect(drawVectorNodeRotateSnapshotMock).not.toHaveBeenCalled();
  });

  it('should draw the frozen drag snapshot instead of the live node when one exists for this node’s id', () => {
    // mock
    const gl = {} as WebGL2RenderingContext;
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const faceBufferCache = new WeakMap<TPoint[], WebGLBuffer>();
    const snapshot: TVectorNodeDragSnapshot = { deltaX: 5, deltaY: 10, facesByColor: [], strokeColor: '#00ff00', strokeVertices: [] };
    const dragSnapshots = new Map([['node-1', snapshot]]);

    // before
    drawSceneVectorNode(gl, program, buffer, faceBufferCache, node, dragSnapshots, null, null, 200, 150, IDENTITY_VIEWPORT);

    // result
    expect(drawVectorNodeDragSnapshotMock).toHaveBeenCalledWith(gl, program, buffer, snapshot, 200, 150, IDENTITY_VIEWPORT);
    expect(drawVectorNodeMock).not.toHaveBeenCalled();
    expect(drawVectorNodeResizeSnapshotMock).not.toHaveBeenCalled();
    expect(drawVectorNodeRotateSnapshotMock).not.toHaveBeenCalled();
  });

  it('should draw the frozen resize snapshot instead of the live node when one exists for this node’s id', () => {
    // mock
    const gl = {} as WebGL2RenderingContext;
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const faceBufferCache = new WeakMap<TPoint[], WebGLBuffer>();
    const snapshot: TVectorNodeResizeSnapshot = {
      anchorX: 0,
      anchorY: 0,
      facesByColor: [],
      flattenedSegments: [],
      pivot: { x: 0, y: 0 },
      rotation: 0,
      scaleX: 2,
      scaleY: 1,
      scaledCenter: { x: 0, y: 0 },
      strokeColor: '#00ff00',
      strokeWidth: 2,
    };
    const resizeSnapshots = new Map([['node-1', snapshot]]);

    // before
    drawSceneVectorNode(gl, program, buffer, faceBufferCache, node, null, resizeSnapshots, null, 200, 150, IDENTITY_VIEWPORT);

    // result
    expect(drawVectorNodeResizeSnapshotMock).toHaveBeenCalledWith(gl, program, buffer, snapshot, 200, 150, IDENTITY_VIEWPORT);
    expect(drawVectorNodeMock).not.toHaveBeenCalled();
    expect(drawVectorNodeDragSnapshotMock).not.toHaveBeenCalled();
    expect(drawVectorNodeRotateSnapshotMock).not.toHaveBeenCalled();
  });

  it('should draw the frozen rotate snapshot instead of the live node when one exists for this node’s id', () => {
    // mock
    const gl = {} as WebGL2RenderingContext;
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const faceBufferCache = new WeakMap<TPoint[], WebGLBuffer>();
    const snapshot: TVectorNodeRotateSnapshot = {
      deltaDegrees: 45,
      facesByColor: [],
      pivot: { x: 0, y: 0 },
      strokeColor: '#00ff00',
      strokeVertices: [],
    };
    const rotateSnapshots = new Map([['node-1', snapshot]]);

    // before
    drawSceneVectorNode(gl, program, buffer, faceBufferCache, node, null, null, rotateSnapshots, 200, 150, IDENTITY_VIEWPORT);

    // result
    expect(drawVectorNodeRotateSnapshotMock).toHaveBeenCalledWith(gl, program, buffer, snapshot, 200, 150, IDENTITY_VIEWPORT);
    expect(drawVectorNodeMock).not.toHaveBeenCalled();
    expect(drawVectorNodeDragSnapshotMock).not.toHaveBeenCalled();
    expect(drawVectorNodeResizeSnapshotMock).not.toHaveBeenCalled();
  });

  it('should prefer the drag snapshot over a resize snapshot when both happen to be present for the same node', () => {
    // mock — shouldn't happen in practice (a node can't be dragged and resized at once), but the drag
    // snapshot is checked first, so it should win deterministically rather than drawing twice
    const gl = {} as WebGL2RenderingContext;
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const faceBufferCache = new WeakMap<TPoint[], WebGLBuffer>();
    const dragSnapshot: TVectorNodeDragSnapshot = { deltaX: 5, deltaY: 10, facesByColor: [], strokeColor: '#00ff00', strokeVertices: [] };
    const resizeSnapshot: TVectorNodeResizeSnapshot = {
      anchorX: 0,
      anchorY: 0,
      facesByColor: [],
      flattenedSegments: [],
      pivot: { x: 0, y: 0 },
      rotation: 0,
      scaleX: 2,
      scaleY: 1,
      scaledCenter: { x: 0, y: 0 },
      strokeColor: '#00ff00',
      strokeWidth: 2,
    };
    const dragSnapshots = new Map([['node-1', dragSnapshot]]);
    const resizeSnapshots = new Map([['node-1', resizeSnapshot]]);

    // before
    drawSceneVectorNode(gl, program, buffer, faceBufferCache, node, dragSnapshots, resizeSnapshots, null, 200, 150, IDENTITY_VIEWPORT);

    // result
    expect(drawVectorNodeDragSnapshotMock).toHaveBeenCalledTimes(1);
    expect(drawVectorNodeResizeSnapshotMock).not.toHaveBeenCalled();
  });

  it('should prefer the resize snapshot over a rotate snapshot when both happen to be present for the same node', () => {
    // mock — shouldn't happen in practice either, but resize is checked before rotate
    const gl = {} as WebGL2RenderingContext;
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const faceBufferCache = new WeakMap<TPoint[], WebGLBuffer>();
    const resizeSnapshot: TVectorNodeResizeSnapshot = {
      anchorX: 0,
      anchorY: 0,
      facesByColor: [],
      flattenedSegments: [],
      pivot: { x: 0, y: 0 },
      rotation: 0,
      scaleX: 2,
      scaleY: 1,
      scaledCenter: { x: 0, y: 0 },
      strokeColor: '#00ff00',
      strokeWidth: 2,
    };
    const rotateSnapshot: TVectorNodeRotateSnapshot = {
      deltaDegrees: 45,
      facesByColor: [],
      pivot: { x: 0, y: 0 },
      strokeColor: '#00ff00',
      strokeVertices: [],
    };
    const resizeSnapshots = new Map([['node-1', resizeSnapshot]]);
    const rotateSnapshots = new Map([['node-1', rotateSnapshot]]);

    // before
    drawSceneVectorNode(gl, program, buffer, faceBufferCache, node, null, resizeSnapshots, rotateSnapshots, 200, 150, IDENTITY_VIEWPORT);

    // result
    expect(drawVectorNodeResizeSnapshotMock).toHaveBeenCalledTimes(1);
    expect(drawVectorNodeRotateSnapshotMock).not.toHaveBeenCalled();
  });
});
