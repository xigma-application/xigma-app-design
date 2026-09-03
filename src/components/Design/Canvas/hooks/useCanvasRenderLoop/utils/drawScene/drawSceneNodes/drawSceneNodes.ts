// utils
import { bindTarget } from './bindTarget';
import { drawLeafNode } from '../drawLeafNode';
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
    const renderer: TMaskRenderer = {
      context,
      gl,
      paintLeaf,
      pool: imageContext.renderTargetPool,
      sceneNodeById: new Map(sceneNodes.map((node) => [node.id, node])),
    };

    gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    renderIds(renderer, rootOrder, null);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    bindTarget(renderer, null);
  }
};
