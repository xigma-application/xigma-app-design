// others
import { DRAFT_FRAME_STROKE } from 'constant/canvas';

// types
import { TPathOutlineStyle } from './getPathOutlineStyles';
import { TPoint } from 'types/canvas';
import { TSceneNode, TVectorNode, TViewport } from 'types/design/types';
import { TVectorNodeDragSnapshot, TVectorNodeResizeSnapshot, TVectorNodeRotateSnapshot } from 'types/design/canvas/types';

// utils
import { drawDashedVectorPathOutline } from 'utils/canvas/drawVectorNode/drawDashedVectorPathOutline/drawDashedVectorPathOutline';
import { drawSceneVectorNode } from './drawSceneVectorNode';
import { isVectorBoundAsTextPath } from 'store/design/utils/isVectorBoundAsTextPath';
import { mirrorGuideVectorForText } from 'components/Design/Canvas/utils/mirrorGuideVectorForText';

export const drawVectorNodeOrTextPathGuide = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  faceBufferCache: WeakMap<TPoint[], WebGLBuffer>,
  strokeBufferCache: WeakMap<number[], WebGLBuffer>,
  node: TVectorNode,
  draggedVectorNodeSnapshots: Map<string, TVectorNodeDragSnapshot> | null,
  resizedVectorNodeSnapshots: Map<string, TVectorNodeResizeSnapshot> | null,
  rotatedVectorNodeSnapshots: Map<string, TVectorNodeRotateSnapshot> | null,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
  pathOutlineStyles: Map<string, TPathOutlineStyle>,
  nodesById: Record<string, TSceneNode>,
  editingPathId?: string | null,
): void => {
  const isTextBeingEdited = pathOutlineStyles.get(node.id) === 'editing';
  const renderNode = mirrorGuideVectorForText(node, nodesById);

  if ((isVectorBoundAsTextPath(nodesById, node.id) || node.id === editingPathId) && isTextBeingEdited) {
    drawDashedVectorPathOutline(gl, program, buffer, renderNode, DRAFT_FRAME_STROKE, canvasWidth, canvasHeight, viewport);
    return;
  }

  drawSceneVectorNode(
    gl,
    program,
    buffer,
    faceBufferCache,
    strokeBufferCache,
    renderNode,
    draggedVectorNodeSnapshots,
    resizedVectorNodeSnapshots,
    rotatedVectorNodeSnapshots,
    canvasWidth,
    canvasHeight,
    viewport,
  );
};
