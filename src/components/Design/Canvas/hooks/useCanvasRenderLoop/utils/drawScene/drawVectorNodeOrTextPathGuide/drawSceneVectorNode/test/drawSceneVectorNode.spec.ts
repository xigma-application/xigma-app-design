// types
import { EffectType, NodeType } from 'types/design/enums';
import { TDrawSceneContext } from '../../../types';
import { TPoint } from 'types/canvas';
import { TVectorNode } from 'types/design/types';
import {
  TCanvasRefs,
  TVectorNodeDragSnapshot,
  TVectorNodeResizeSnapshot,
  TVectorNodeRotateSnapshot,
  TVectorSnapshotsRefs,
} from 'types/design/canvas/types';

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
vi.mock('../drawVectorNodeResizeSnapshot/drawVectorNodeResizeSnapshot', () => ({
  drawVectorNodeResizeSnapshot: (...args: unknown[]): void => drawVectorNodeResizeSnapshotMock(...args),
}));
vi.mock('../drawVectorNodeRotateSnapshot/drawVectorNodeRotateSnapshot', () => ({
  drawVectorNodeRotateSnapshot: (...args: unknown[]): void => drawVectorNodeRotateSnapshotMock(...args),
}));

const drawBooleanEffectsMock = vi.fn();
const getSceneVectorEffectShapeMock = vi.fn<(...args: unknown[]) => unknown>(() => null);

vi.mock('../../../drawBooleanLeafNode/drawBooleanEffects', () => ({
  drawBooleanEffects: (...args: unknown[]): void => drawBooleanEffectsMock(...args),
}));
vi.mock('../getSceneVectorEffectShape', () => ({
  getSceneVectorEffectShape: (...args: unknown[]): unknown => getSceneVectorEffectShapeMock(...args),
}));

const asRefs = (vectorSnapshots: TVectorSnapshotsRefs): TCanvasRefs => ({ vectorSnapshots }) as TCanvasRefs;

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
  strokeWidth: 2,
  strokes: [{ color: '#00ff00', opacity: 100, type: 'solid' }],
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
    drawSceneVectorNode(context, node, asRefs(createVectorSnapshotsRefs()));

    // result
    expect(drawVectorNodeMock).toHaveBeenCalledWith(context, node, 1);
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
    drawSceneVectorNode(context, node, asRefs(vectorSnapshots));

    // result
    expect(drawVectorNodeMock).toHaveBeenCalledWith(context, node, 1);
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
    const snapshot: TVectorNodeDragSnapshot = {
      deltaX: 5,
      deltaY: 10,
      facesByPaint: [],
      strokeVertices: [],
      strokes: [{ color: '#00ff00', opacity: 100, type: 'solid' }],
    };
    const vectorSnapshots = createVectorSnapshotsRefs({
      draggedVectorNodeSnapshotsRef: { current: new Map([['node-1', snapshot]]) },
    });

    // before
    drawSceneVectorNode(context, node, asRefs(vectorSnapshots));

    // result
    expect(drawVectorNodeDragSnapshotMock).toHaveBeenCalledWith(context, snapshot, 1);
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
      strokeWidth: 2,
      strokes: [{ color: '#00ff00', opacity: 100, type: 'solid' }],
    };
    const vectorSnapshots = createVectorSnapshotsRefs({
      resizedVectorNodeSnapshotsRef: { current: new Map([['node-1', snapshot]]) },
    });

    // before
    drawSceneVectorNode(context, node, asRefs(vectorSnapshots));

    // result
    expect(drawVectorNodeResizeSnapshotMock).toHaveBeenCalledWith(context, snapshot, 1);
    expect(drawVectorNodeMock).not.toHaveBeenCalled();
    expect(drawVectorNodeDragSnapshotMock).not.toHaveBeenCalled();
    expect(drawVectorNodeRotateSnapshotMock).not.toHaveBeenCalled();
  });

  it('should draw a frozen snapshot with its fills and stroke at the node opacity', () => {
    // mock
    const context = buildContext({} as WebGL2RenderingContext, {} as WebGLProgram, {} as WebGLBuffer, {} as WebGLProgram);
    const snapshot: TVectorNodeResizeSnapshot = {
      anchorX: 0,
      anchorY: 0,
      facesByPaint: [{ paint: [{ color: '#ff0000', opacity: 80, type: 'solid' }], points: [] }],
      flattenedSegments: [],
      pivot: { x: 0, y: 0 },
      rotation: 0,
      scaleX: 2,
      scaleY: 1,
      scaledCenter: { x: 0, y: 0 },
      strokeWidth: 2,
      strokes: [{ color: '#00ff00', opacity: 100, type: 'solid' }],
    };
    const vectorSnapshots = createVectorSnapshotsRefs({
      resizedVectorNodeSnapshotsRef: { current: new Map([['node-1', snapshot]]) },
    });

    // before
    drawSceneVectorNode(context, node, asRefs(vectorSnapshots), 0.5);

    // result
    expect(drawVectorNodeResizeSnapshotMock).toHaveBeenCalledWith(
      context,
      { ...snapshot, facesByPaint: [{ paint: [{ color: '#ff0000', opacity: 40, type: 'solid' }], points: [] }] },
      0.5,
    );
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
      strokeVertices: [],
      strokes: [{ color: '#00ff00', opacity: 100, type: 'solid' }],
    };
    const vectorSnapshots = createVectorSnapshotsRefs({
      rotatedVectorNodeSnapshotsRef: { current: new Map([['node-1', snapshot]]) },
    });

    // before
    drawSceneVectorNode(context, node, asRefs(vectorSnapshots));

    // result
    expect(drawVectorNodeRotateSnapshotMock).toHaveBeenCalledWith(context, snapshot, 1);
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
    const dragSnapshot: TVectorNodeDragSnapshot = {
      deltaX: 5,
      deltaY: 10,
      facesByPaint: [],
      strokeVertices: [],
      strokes: [{ color: '#00ff00', opacity: 100, type: 'solid' }],
    };
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
      strokeWidth: 2,
      strokes: [{ color: '#00ff00', opacity: 100, type: 'solid' }],
    };
    const vectorSnapshots = createVectorSnapshotsRefs({
      draggedVectorNodeSnapshotsRef: { current: new Map([['node-1', dragSnapshot]]) },
      resizedVectorNodeSnapshotsRef: { current: new Map([['node-1', resizeSnapshot]]) },
    });

    // before
    drawSceneVectorNode(context, node, asRefs(vectorSnapshots));

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
      strokeWidth: 2,
      strokes: [{ color: '#00ff00', opacity: 100, type: 'solid' }],
    };
    const rotateSnapshot: TVectorNodeRotateSnapshot = {
      deltaDegrees: 45,
      facesByPaint: [],
      pivot: { x: 0, y: 0 },
      strokeVertices: [],
      strokes: [{ color: '#00ff00', opacity: 100, type: 'solid' }],
    };
    const vectorSnapshots = createVectorSnapshotsRefs({
      resizedVectorNodeSnapshotsRef: { current: new Map([['node-1', resizeSnapshot]]) },
      rotatedVectorNodeSnapshotsRef: { current: new Map([['node-1', rotateSnapshot]]) },
    });

    // before
    drawSceneVectorNode(context, node, asRefs(vectorSnapshots));

    // result
    expect(drawVectorNodeResizeSnapshotMock).toHaveBeenCalledTimes(1);
    expect(drawVectorNodeRotateSnapshotMock).not.toHaveBeenCalled();
  });

  it('should draw the drop shadow under the vector and the inner shadow and noise over it', () => {
    // mock
    const context = buildContext({} as WebGL2RenderingContext, {} as WebGLProgram, {} as WebGLBuffer, {} as WebGLProgram);
    const refs = asRefs(createVectorSnapshotsRefs());
    const shape = { bounds: { height: 1, width: 1, x: 0, y: 0 }, key: 1, polygons: [] };
    const order: string[] = [];

    getSceneVectorEffectShapeMock.mockReturnValueOnce(shape);
    drawBooleanEffectsMock.mockImplementation((...args: unknown[]) => order.push(String(args[5])));
    drawVectorNodeMock.mockImplementationOnce(() => order.push('vector'));

    // before
    drawSceneVectorNode(context, node, refs, 0.5);

    // result
    expect(getSceneVectorEffectShapeMock).toHaveBeenCalledWith(node, refs.vectorSnapshots);
    expect(drawBooleanEffectsMock).toHaveBeenCalledWith(context, node, shape, 0.5, refs, EffectType.dropShadow);
    expect(order).toEqual([EffectType.dropShadow, 'vector', EffectType.innerShadow, EffectType.noise]);
  });
});
