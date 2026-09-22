// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDrawSceneContext } from '../types';
import { TMaskRenderer } from '../drawSceneNodes/types';
import { TSceneNode } from 'types/design/types';

// utils
import { drawLeafNode } from '../drawLeafNode';
import { getHoistedDragIds } from '../drawSceneNodes/getHoistedDragIds';
import { markNodeDrawnOverGlassBackdrop } from '../drawSceneNodes/markNodeDrawnOverGlassBackdrop';

export const buildExportMaskRenderer = (
  renderContext: TDrawSceneContext,
  nodesById: Record<string, TSceneNode>,
  refs: TCanvasRefs,
): TMaskRenderer => {
  const sceneNodeById = new Map(Object.entries(nodesById));
  const renderer: TMaskRenderer = {
    context: renderContext,
    gl: renderContext.gl,
    hoistedIds: getHoistedDragIds(refs, sceneNodeById),
    paintLeaf: (node, phase) => {
      drawLeafNode(renderContext, node, new Map(), refs, nodesById, null, 0, phase);
      markNodeDrawnOverGlassBackdrop(renderer, node);
    },
    pool: renderContext.imageContext.renderTargetPool,
    refs,
    sceneNodeById,
  };

  return renderer;
};
