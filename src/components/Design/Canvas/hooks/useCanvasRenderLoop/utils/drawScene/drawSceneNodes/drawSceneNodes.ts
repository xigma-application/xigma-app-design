// utils
import { bindTarget } from './bindTarget';
import { drawBatchedSceneNodes } from './drawBatchedSceneNodes';
import { drawLeafNode } from '../drawLeafNode';
import { getBooleanOperandFreeNodes } from './getBooleanOperandFreeNodes';
import { getGridTrackAffordanceDragSceneNodes } from '../getGridTrackAffordanceDragSceneNodes';
import { getHoistedDragIds } from './getHoistedDragIds';
import { getNodeBackgroundBlur } from './getNodeBackgroundBlur';
import { getNodeGlass } from './getNodeGlass';
import { getNodeLayerBlur } from './getNodeLayerBlur';
import { getNodeTexture } from './getNodeTexture';
import { hasFrameNoiseOverChildren } from './hasFrameNoiseOverChildren';
import { hasFrameStrokeOverChildren } from './hasFrameStrokeOverChildren';
import { hasRealBlendMode } from './hasRealBlendMode';
import { markNodeDrawnOverGlassBackdrop } from './markNodeDrawnOverGlassBackdrop';
import { releaseGlassBackdrop } from './releaseGlassBackdrop';
import { renderHoistedIds } from './renderHoistedIds';
import { renderIds } from './renderIds';
import { sweepFaceBuffers } from 'utils/canvas/faceBufferCache/sweepFaceBuffers';
import { sweepRectChunks } from 'utils/canvas/drawRectBatch/sweepRectChunks';

// types
import { NodeType } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TBoxPaintPhase, TDrawSceneContext } from '../types';
import { TMaskRenderer } from './types';
import { TPathOutlineStyle } from '../getPathOutlineStyles';
import { TSceneNode } from 'types/design/types';

export const drawSceneNodes = (
  context: TDrawSceneContext,
  rawSceneNodes: TSceneNode[],
  rootOrder: string[],
  pathOutlineStyles: Map<string, TPathOutlineStyle>,
  refs: TCanvasRefs,
  rawNodesById: Record<string, TSceneNode>,
  editingPathId?: string | null,
): void => {
  const { nodesById, sceneNodes } = getGridTrackAffordanceDragSceneNodes(refs, rawNodesById, rawSceneNodes);
  const paintLeaf = (node: TSceneNode, phase?: TBoxPaintPhase): void =>
    drawLeafNode(context, node, pathOutlineStyles, refs, nodesById, editingPathId, 0, phase);

  if (
    !sceneNodes.some(
      (node) =>
        node.type === NodeType.mask ||
        (node.type === NodeType.frame && node.clipContent && node.childIds.length > 0) ||
        hasFrameStrokeOverChildren(node) ||
        hasFrameNoiseOverChildren(node) ||
        hasRealBlendMode(node, refs) ||
        getNodeLayerBlur(node) > 0 ||
        Boolean(getNodeTexture(node)) ||
        Boolean(getNodeGlass(node)) ||
        getNodeBackgroundBlur(node) > 0,
    )
  ) {
    drawBatchedSceneNodes(context, getBooleanOperandFreeNodes(sceneNodes, nodesById), nodesById, refs, paintLeaf);
  } else {
    const { gl, imageContext } = context;
    const sceneNodeById = new Map(sceneNodes.map((node) => [node.id, node]));
    const renderer: TMaskRenderer = {
      context,
      gl,
      hoistedIds: getHoistedDragIds(refs, sceneNodeById),
      paintLeaf: (node, phase) => {
        paintLeaf(node, phase);
        markNodeDrawnOverGlassBackdrop(renderer, node);
      },
      pool: imageContext.renderTargetPool,
      refs,
      sceneNodeById,
    };

    gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    renderIds(renderer, rootOrder, null);
    renderHoistedIds(renderer);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    bindTarget(renderer, null);
    releaseGlassBackdrop(renderer);
  }

  sweepRectChunks(context.gl);
  sweepFaceBuffers(context.gl);
};
