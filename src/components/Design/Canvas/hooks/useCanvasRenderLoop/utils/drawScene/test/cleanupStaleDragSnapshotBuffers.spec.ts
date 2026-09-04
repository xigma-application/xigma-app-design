// types
import { TPoint } from 'types/canvas';
import { TDrawSceneContext } from '../types';
import { TVectorNodeDragSnapshot } from 'types/design/canvas/types';

// utils
import { cleanupStaleDragSnapshotBuffers } from '../cleanupStaleDragSnapshotBuffers';
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';

const createGlMock = (): WebGL2RenderingContext =>
  ({
    deleteBuffer: vi.fn(),
  }) as unknown as WebGL2RenderingContext;

const buildContext = (
  gl: WebGL2RenderingContext,
  dragSnapshotFaceBufferCache: WeakMap<TPoint[], WebGLBuffer>,
  dragSnapshotStrokeBufferCache: WeakMap<number[], WebGLBuffer>,
  dragSnapshotTrackedByNodeId: Map<string, TVectorNodeDragSnapshot>,
): TDrawSceneContext =>
  ({
    gl,
    imageContext: { dragSnapshotFaceBufferCache, dragSnapshotStrokeBufferCache, dragSnapshotTrackedByNodeId },
  }) as unknown as TDrawSceneContext;

const buildSnapshot = (facePoints: TPoint[], strokeVertices: number[]): TVectorNodeDragSnapshot => ({
  deltaX: 0,
  deltaY: 0,
  facesByPaint: [{ paint: [{ color: '#ff0000', opacity: 100, type: 'solid' }], points: [facePoints] }],
  strokeColor: '#0d99ff',
  strokeVertices,
});

describe('cleanupStaleDragSnapshotBuffers', () => {
  it('should do nothing when nothing has ever been tracked and no drag is active', () => {
    // mock
    const gl = createGlMock();
    const context = buildContext(gl, new WeakMap(), new WeakMap(), new Map());
    const refs = createCanvasRefs();

    // before
    cleanupStaleDragSnapshotBuffers(context, refs);

    // result
    expect(gl.deleteBuffer).not.toHaveBeenCalled();
  });

  it('should delete a tracked node’s face and stroke buffers and drop it once its drag is no longer present', () => {
    // mock — snapshot was tracked last frame, this frame the drag ended (no ref entry for it)
    const face: TPoint[] = [{ x: 0, y: 0 }];
    const strokeVertices = [0, 0, 1, 1];
    const snapshot = buildSnapshot(face, strokeVertices);
    const faceBuffer = {} as WebGLBuffer;
    const strokeBuffer = {} as WebGLBuffer;
    const faceBufferCache = new WeakMap<TPoint[], WebGLBuffer>([[face, faceBuffer]]);
    const strokeBufferCache = new WeakMap<number[], WebGLBuffer>([[strokeVertices, strokeBuffer]]);
    const trackedByNodeId = new Map([['node-1', snapshot]]);
    const gl = createGlMock();
    const context = buildContext(gl, faceBufferCache, strokeBufferCache, trackedByNodeId);
    const refs = createCanvasRefs();

    // before
    cleanupStaleDragSnapshotBuffers(context, refs);

    // result
    expect(gl.deleteBuffer).toHaveBeenCalledWith(faceBuffer);
    expect(gl.deleteBuffer).toHaveBeenCalledWith(strokeBuffer);
    expect(trackedByNodeId.has('node-1')).toBe(false);
  });

  it('should skip a face/stroke that never actually got a buffer created, without throwing', () => {
    // mock — e.g. a paint group with zero visible faces this drag, or stroke never drawn
    const face: TPoint[] = [{ x: 0, y: 0 }];
    const snapshot = buildSnapshot(face, []);
    const trackedByNodeId = new Map([['node-1', snapshot]]);
    const gl = createGlMock();
    const context = buildContext(gl, new WeakMap(), new WeakMap(), trackedByNodeId);
    const refs = createCanvasRefs();

    // before
    cleanupStaleDragSnapshotBuffers(context, refs);

    // result
    expect(gl.deleteBuffer).not.toHaveBeenCalled();
    expect(trackedByNodeId.has('node-1')).toBe(false);
  });

  it('should leave an ongoing drag’s buffers untouched when the same snapshot object is still current', () => {
    // mock — updateDragSnapshotDeltas mutates deltaX/deltaY in place, keeping the same object reference
    const face: TPoint[] = [{ x: 0, y: 0 }];
    const snapshot = buildSnapshot(face, [0, 0, 1, 1]);
    const faceBuffer = {} as WebGLBuffer;
    const faceBufferCache = new WeakMap<TPoint[], WebGLBuffer>([[face, faceBuffer]]);
    const trackedByNodeId = new Map([['node-1', snapshot]]);
    const gl = createGlMock();
    const context = buildContext(gl, faceBufferCache, new WeakMap(), trackedByNodeId);
    const refs = createCanvasRefs({
      vectorSnapshots: { draggedVectorNodeSnapshotsRef: { current: new Map([['node-1', snapshot]]) } },
    });

    // before
    cleanupStaleDragSnapshotBuffers(context, refs);

    // result
    expect(gl.deleteBuffer).not.toHaveBeenCalled();
    expect(trackedByNodeId.get('node-1')).toBe(snapshot);
  });

  it('should treat a different snapshot object for the same node id as stale, cleaning the old one up', () => {
    // mock — same node, but a genuinely new snapshot object (not just a mutated delta)
    const oldFace: TPoint[] = [{ x: 0, y: 0 }];
    const newFace: TPoint[] = [{ x: 5, y: 5 }];
    const oldSnapshot = buildSnapshot(oldFace, []);
    const newSnapshot = buildSnapshot(newFace, []);
    const oldFaceBuffer = {} as WebGLBuffer;
    const faceBufferCache = new WeakMap<TPoint[], WebGLBuffer>([[oldFace, oldFaceBuffer]]);
    const trackedByNodeId = new Map([['node-1', oldSnapshot]]);
    const gl = createGlMock();
    const context = buildContext(gl, faceBufferCache, new WeakMap(), trackedByNodeId);
    const refs = createCanvasRefs({
      vectorSnapshots: { draggedVectorNodeSnapshotsRef: { current: new Map([['node-1', newSnapshot]]) } },
    });

    // before
    cleanupStaleDragSnapshotBuffers(context, refs);

    // result
    expect(gl.deleteBuffer).toHaveBeenCalledWith(oldFaceBuffer);
    expect(trackedByNodeId.get('node-1')).toBe(newSnapshot);
  });

  it('should start tracking a newly-started drag without touching any buffers yet', () => {
    // mock
    const snapshot = buildSnapshot([{ x: 0, y: 0 }], []);
    const trackedByNodeId = new Map<string, TVectorNodeDragSnapshot>();
    const gl = createGlMock();
    const context = buildContext(gl, new WeakMap(), new WeakMap(), trackedByNodeId);
    const refs = createCanvasRefs({
      vectorSnapshots: { draggedVectorNodeSnapshotsRef: { current: new Map([['node-1', snapshot]]) } },
    });

    // before
    cleanupStaleDragSnapshotBuffers(context, refs);

    // result
    expect(gl.deleteBuffer).not.toHaveBeenCalled();
    expect(trackedByNodeId.get('node-1')).toBe(snapshot);
  });

  it('should clean up multiple faces across multiple paint groups for the same ended drag', () => {
    // mock
    const faceA: TPoint[] = [{ x: 0, y: 0 }];
    const faceB: TPoint[] = [{ x: 1, y: 1 }];
    const snapshot: TVectorNodeDragSnapshot = {
      deltaX: 0,
      deltaY: 0,
      facesByPaint: [
        { paint: [{ color: '#ff0000', opacity: 100, type: 'solid' }], points: [faceA] },
        { paint: [{ color: '#00ff00', opacity: 100, type: 'solid' }], points: [faceB] },
      ],
      strokeColor: '#0d99ff',
      strokeVertices: [],
    };
    const bufferA = {} as WebGLBuffer;
    const bufferB = {} as WebGLBuffer;
    const faceBufferCache = new WeakMap<TPoint[], WebGLBuffer>([
      [faceA, bufferA],
      [faceB, bufferB],
    ]);
    const trackedByNodeId = new Map([['node-1', snapshot]]);
    const gl = createGlMock();
    const context = buildContext(gl, faceBufferCache, new WeakMap(), trackedByNodeId);
    const refs = createCanvasRefs();

    // before
    cleanupStaleDragSnapshotBuffers(context, refs);

    // result
    expect(gl.deleteBuffer).toHaveBeenCalledWith(bufferA);
    expect(gl.deleteBuffer).toHaveBeenCalledWith(bufferB);
    expect(gl.deleteBuffer).toHaveBeenCalledTimes(2);
  });
});
