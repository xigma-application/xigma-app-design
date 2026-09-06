// utils
import { bindTarget } from './bindTarget';
import { drawLeafNode } from '../drawLeafNode';
import { getHoistedDragIds } from './getHoistedDragIds';
import { renderHoistedIds } from './renderHoistedIds';
import { renderIds } from './renderIds';

// types
import { NodeType } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDrawSceneContext } from '../types';
import { TMaskRenderer } from './types';
import { TPathOutlineStyle } from '../getPathOutlineStyles';
import { TSceneNode } from 'types/design/types';

export const drawSceneNodes = (
  context: TDrawSceneContext,
  sceneNodes: TSceneNode[],
  rootOrder: string[],
  pathOutlineStyles: Map<string, TPathOutlineStyle>,
  refs: TCanvasRefs,
  nodesById: Record<string, TSceneNode>,
  editingPathId?: string | null,
): void => {
  const paintLeaf = (node: TSceneNode): void => drawLeafNode(context, node, pathOutlineStyles, refs, nodesById, editingPathId);

  if (!sceneNodes.some((node) => node.isMask || (node.type === NodeType.frame && node.clipContent && node.childIds.length > 0))) {
    sceneNodes.forEach(paintLeaf);
  } else {
    const { gl, imageContext } = context;
    const sceneNodeById = new Map(sceneNodes.map((node) => [node.id, node]));
    const renderer: TMaskRenderer = {
      context,
      gl,
      hoistedIds: getHoistedDragIds(refs, sceneNodeById),
      paintLeaf,
      pool: imageContext.renderTargetPool,
      sceneNodeById,
    };

    gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    renderIds(renderer, rootOrder, null);
    renderHoistedIds(renderer);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    bindTarget(renderer, null);
  }
};
