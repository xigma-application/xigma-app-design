// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDrawSceneContext } from './types';

export const cleanupStaleDragSnapshotBuffers = (context: TDrawSceneContext, refs: TCanvasRefs): void => {
  const { gl, imageContext } = context;
  const { dragSnapshotFaceBufferCache, dragSnapshotStrokeBufferCache, dragSnapshotTrackedByNodeId } = imageContext;
  const currentSnapshots = refs.vectorSnapshots.draggedVectorNodeSnapshotsRef.current;

  dragSnapshotTrackedByNodeId.forEach((snapshot, nodeId) => {
    if (currentSnapshots?.get(nodeId) === snapshot) {
      return;
    }

    snapshot.facesByPaint.forEach(({ points }) => {
      points.forEach((face) => {
        const buffer = dragSnapshotFaceBufferCache.get(face);

        if (buffer) {
          gl.deleteBuffer(buffer);
        }
      });
    });

    const strokeBuffer = dragSnapshotStrokeBufferCache.get(snapshot.strokeVertices);

    if (strokeBuffer) {
      gl.deleteBuffer(strokeBuffer);
    }

    dragSnapshotTrackedByNodeId.delete(nodeId);
  });

  currentSnapshots?.forEach((snapshot, nodeId) => {
    dragSnapshotTrackedByNodeId.set(nodeId, snapshot);
  });
};
