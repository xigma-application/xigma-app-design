// types
import { NodeType } from 'types/design/enums';
import { TDrawSceneContext } from '../../../types';
import { TPoint } from 'types/canvas';
import { TVectorNode } from 'types/design/types';
import { TVectorNodeDragSnapshot, TVectorNodeResizeSnapshot, TVectorNodeRotateSnapshot } from 'types/design/canvas/types';

// utils
import { createVectorSnapshotsRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/hooks/useVectorSnapshotsRefs/createVectorSnapshotsRefs';
import { drawSceneVectorNode } from '../drawSceneVectorNode';

const drawVectorNodeMock = vi.fn();
const drawVectorNodeDragSnapshotMock = vi.fn();
const drawVectorNodeResizeSnapshotMock = vi.fn();
const drawVectorNodeRotateSnapshotMock = vi.fn();

vi.mock('../drawVectorNode', () => ({
  drawVectorNode: (...args: unknown[]): void => drawVectorNodeMock(...args),
}));
vi.mock('../drawVectorNodeDragSnapshot', () => ({
  drawVectorNodeDragSnapshot: (...args: unknown[]): void => drawVectorNodeDragSnapshotMock(...args),
}));
vi.mock('../drawVectorNodeResizeSnapshot', () => ({
  drawVectorNodeResizeSnapshot: (...args: unknown[]): void => drawVectorNodeResizeSnapshotMock(...args),
}));
vi.mock('../drawVectorNodeRotateSnapshot', () => ({
  drawVectorNodeRotateSnapshot: (...args: unknown[]): void => drawVectorNodeRotateSnapshotMock(...args),
}));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const IS_ALPHA_WRITE_ENABLED = false;

const node: TVectorNode = {
  defaultFill: null,
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

const buildContext = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  dragSnapshotProgram: WebGLProgram,
): TDrawSceneContext => ({
  buffer,
  canvasHeight: 150,
  canvasWidth: 200,
  gl,
  imageContext: {
    dragSnapshotFaceBufferCache: new WeakMap<TPoint[], WebGLBuffer>(),
    dragSnapshotProgram,
    dragSnapshotStrokeBufferCache: new WeakMap<number[], WebGLBuffer>(),
    faceBufferCache: new WeakMap<TPoint[], WebGLBuffer>(),
    isAlphaWriteEnabled: IS_ALPHA_WRITE_ENABLED,
    strokeBufferCache: new WeakMap<number[], WebGLBuffer>(),
  } as TDrawSceneContext['imageContext'],
  program,
  viewport: IDENTITY_VIEWPORT,
});

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
    const dragSnapshotProgram = {} as WebGLProgram;
    const context = buildContext(gl, program, buffer, dragSnapshotProgram);

    // before
    drawSceneVectorNode(context, node, createVectorSnapshotsRefs());

    // result
    expect(drawVectorNodeMock).toHaveBeenCalledWith(context, node);
    expect(drawVectorNodeDragSnapshotMock).not.toHaveBeenCalled();
    expect(drawVectorNodeResizeSnapshotMock).not.toHaveBeenCalled();
    expect(drawVectorNodeRotateSnapshotMock).not.toHaveBeenCalled();
  });

  it('should draw the node normally when the snapshot maps exist but have no entry for this node', () => {
    // mock
    const gl = {} as WebGL2RenderingContext;
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const dragSnapshotProgram = {} as WebGLProgram;
    const context = buildContext(gl, program, buffer, dragSnapshotProgram);
    const vectorSnapshots = createVectorSnapshotsRefs({
      draggedVectorNodeSnapshotsRef: { current: new Map<string, TVectorNodeDragSnapshot>() },
      resizedVectorNodeSnapshotsRef: { current: new Map<string, TVectorNodeResizeSnapshot>() },
      rotatedVectorNodeSnapshotsRef: { current: new Map<string, TVectorNodeRotateSnapshot>() },
    });

    // before
    drawSceneVectorNode(context, node, vectorSnapshots);

    // result
    expect(drawVectorNodeMock).toHaveBeenCalledWith(context, node);
    expect(drawVectorNodeDragSnapshotMock).not.toHaveBeenCalled();
    expect(drawVectorNodeResizeSnapshotMock).not.toHaveBeenCalled();
    expect(drawVectorNodeRotateSnapshotMock).not.toHaveBeenCalled();
  });

  it('should draw the frozen drag snapshot instead of the live node when one exists for this node’s id', () => {
    // mock
    const gl = {} as WebGL2RenderingContext;
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const dragSnapshotProgram = {} as WebGLProgram;
    const context = buildContext(gl, program, buffer, dragSnapshotProgram);
    const snapshot: TVectorNodeDragSnapshot = { deltaX: 5, deltaY: 10, facesByPaint: [], strokeColor: '#00ff00', strokeVertices: [] };
    const vectorSnapshots = createVectorSnapshotsRefs({
      draggedVectorNodeSnapshotsRef: { current: new Map([['node-1', snapshot]]) },
    });

    // before
    drawSceneVectorNode(context, node, vectorSnapshots);

    // result
    expect(drawVectorNodeDragSnapshotMock).toHaveBeenCalledWith(context, snapshot);
    expect(drawVectorNodeMock).not.toHaveBeenCalled();
    expect(drawVectorNodeResizeSnapshotMock).not.toHaveBeenCalled();
    expect(drawVectorNodeRotateSnapshotMock).not.toHaveBeenCalled();
  });

  it('should draw the frozen resize snapshot instead of the live node when one exists for this node’s id', () => {
    // mock
    const gl = {} as WebGL2RenderingContext;
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const dragSnapshotProgram = {} as WebGLProgram;
    const context = buildContext(gl, program, buffer, dragSnapshotProgram);
    const snapshot: TVectorNodeResizeSnapshot = {
      anchorX: 0,
      anchorY: 0,
      facesByPaint: [],
      flattenedSegments: [],
      pivot: { x: 0, y: 0 },
      rotation: 0,
      scaleX: 2,
      scaleY: 1,
      scaledCenter: { x: 0, y: 0 },
      strokeColor: '#00ff00',
      strokeWidth: 2,
    };
    const vectorSnapshots = createVectorSnapshotsRefs({
      resizedVectorNodeSnapshotsRef: { current: new Map([['node-1', snapshot]]) },
    });

    // before
    drawSceneVectorNode(context, node, vectorSnapshots);

    // result
    expect(drawVectorNodeResizeSnapshotMock).toHaveBeenCalledWith(context, snapshot);
    expect(drawVectorNodeMock).not.toHaveBeenCalled();
    expect(drawVectorNodeDragSnapshotMock).not.toHaveBeenCalled();
    expect(drawVectorNodeRotateSnapshotMock).not.toHaveBeenCalled();
  });

  it('should draw the frozen rotate snapshot instead of the live node when one exists for this node’s id', () => {
    // mock
    const gl = {} as WebGL2RenderingContext;
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const dragSnapshotProgram = {} as WebGLProgram;
    const context = buildContext(gl, program, buffer, dragSnapshotProgram);
    const snapshot: TVectorNodeRotateSnapshot = {
      deltaDegrees: 45,
      facesByPaint: [],
      pivot: { x: 0, y: 0 },
      strokeColor: '#00ff00',
      strokeVertices: [],
    };
    const vectorSnapshots = createVectorSnapshotsRefs({
      rotatedVectorNodeSnapshotsRef: { current: new Map([['node-1', snapshot]]) },
    });

    // before
    drawSceneVectorNode(context, node, vectorSnapshots);

    // result
    expect(drawVectorNodeRotateSnapshotMock).toHaveBeenCalledWith(context, snapshot);
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
    const dragSnapshotProgram = {} as WebGLProgram;
    const context = buildContext(gl, program, buffer, dragSnapshotProgram);
    const dragSnapshot: TVectorNodeDragSnapshot = { deltaX: 5, deltaY: 10, facesByPaint: [], strokeColor: '#00ff00', strokeVertices: [] };
    const resizeSnapshot: TVectorNodeResizeSnapshot = {
      anchorX: 0,
      anchorY: 0,
      facesByPaint: [],
      flattenedSegments: [],
      pivot: { x: 0, y: 0 },
      rotation: 0,
      scaleX: 2,
      scaleY: 1,
      scaledCenter: { x: 0, y: 0 },
      strokeColor: '#00ff00',
      strokeWidth: 2,
    };
    const vectorSnapshots = createVectorSnapshotsRefs({
      draggedVectorNodeSnapshotsRef: { current: new Map([['node-1', dragSnapshot]]) },
      resizedVectorNodeSnapshotsRef: { current: new Map([['node-1', resizeSnapshot]]) },
    });

    // before
    drawSceneVectorNode(context, node, vectorSnapshots);

    // result
    expect(drawVectorNodeDragSnapshotMock).toHaveBeenCalledTimes(1);
    expect(drawVectorNodeResizeSnapshotMock).not.toHaveBeenCalled();
  });

  it('should prefer the resize snapshot over a rotate snapshot when both happen to be present for the same node', () => {
    // mock — shouldn't happen in practice either, but resize is checked before rotate
    const gl = {} as WebGL2RenderingContext;
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const dragSnapshotProgram = {} as WebGLProgram;
    const context = buildContext(gl, program, buffer, dragSnapshotProgram);
    const resizeSnapshot: TVectorNodeResizeSnapshot = {
      anchorX: 0,
      anchorY: 0,
      facesByPaint: [],
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
      facesByPaint: [],
      pivot: { x: 0, y: 0 },
      strokeColor: '#00ff00',
      strokeVertices: [],
    };
    const vectorSnapshots = createVectorSnapshotsRefs({
      resizedVectorNodeSnapshotsRef: { current: new Map([['node-1', resizeSnapshot]]) },
      rotatedVectorNodeSnapshotsRef: { current: new Map([['node-1', rotateSnapshot]]) },
    });

    // before
    drawSceneVectorNode(context, node, vectorSnapshots);

    // result
    expect(drawVectorNodeResizeSnapshotMock).toHaveBeenCalledTimes(1);
    expect(drawVectorNodeRotateSnapshotMock).not.toHaveBeenCalled();
  });
});
