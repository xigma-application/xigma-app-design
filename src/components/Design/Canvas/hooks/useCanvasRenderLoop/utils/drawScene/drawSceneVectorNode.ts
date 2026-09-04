// types
import { TPoint } from 'types/canvas';
import { TVectorNode, TViewport } from 'types/design/types';
import { TVectorNodeDragSnapshot, TVectorNodeResizeSnapshot, TVectorNodeRotateSnapshot } from 'types/design/canvas/types';

// utils
import { drawVectorNode } from 'utils/canvas/drawVectorNode/drawVectorNode';
import { drawVectorNodeDragSnapshot } from 'utils/canvas/drawVectorNode/drawVectorNodeDragSnapshot';
import { drawVectorNodeResizeSnapshot } from 'utils/canvas/drawVectorNode/drawVectorNodeResizeSnapshot';
import { drawVectorNodeRotateSnapshot } from 'utils/canvas/drawVectorNode/drawVectorNodeRotateSnapshot';

export const drawSceneVectorNode = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  faceBufferCache: WeakMap<TPoint[], WebGLBuffer>,
  strokeBufferCache: WeakMap<number[], WebGLBuffer>,
  dragSnapshotProgram: WebGLProgram,
  dragSnapshotFaceBufferCache: WeakMap<TPoint[], WebGLBuffer>,
  dragSnapshotStrokeBufferCache: WeakMap<number[], WebGLBuffer>,
  node: TVectorNode,
  draggedVectorNodeSnapshots: Map<string, TVectorNodeDragSnapshot> | null,
  resizedVectorNodeSnapshots: Map<string, TVectorNodeResizeSnapshot> | null,
  rotatedVectorNodeSnapshots: Map<string, TVectorNodeRotateSnapshot> | null,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  const dragSnapshot = draggedVectorNodeSnapshots?.get(node.id);
  const resizeSnapshot = resizedVectorNodeSnapshots?.get(node.id);
  const rotateSnapshot = rotatedVectorNodeSnapshots?.get(node.id);

  switch (true) {
    case Boolean(dragSnapshot):
      drawVectorNodeDragSnapshot(
        gl,
        dragSnapshotProgram,
        buffer,
        dragSnapshotFaceBufferCache,
        dragSnapshotStrokeBufferCache,
        dragSnapshot!,
        canvasWidth,
        canvasHeight,
        viewport,
      );
      break;
    case Boolean(resizeSnapshot):
      drawVectorNodeResizeSnapshot(gl, program, buffer, resizeSnapshot!, canvasWidth, canvasHeight, viewport);
      break;
    case Boolean(rotateSnapshot):
      drawVectorNodeRotateSnapshot(gl, program, buffer, rotateSnapshot!, canvasWidth, canvasHeight, viewport);
      break;
    default:
      drawVectorNode(gl, program, buffer, faceBufferCache, strokeBufferCache, node, canvasWidth, canvasHeight, viewport);
  }
};
