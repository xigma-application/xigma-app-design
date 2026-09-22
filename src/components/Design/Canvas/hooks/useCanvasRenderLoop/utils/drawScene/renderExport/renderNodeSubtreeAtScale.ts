// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDraftRect } from 'types/canvas';
import { TDrawSceneContext } from '../types';
import { TMaskRenderer } from '../drawSceneNodes/types';
import { TSceneNode } from 'types/design/types';

// utils
import { drawLeafNode } from '../drawLeafNode';
import { getHoistedDragIds } from '../drawSceneNodes/getHoistedDragIds';
import { markNodeDrawnOverGlassBackdrop } from '../drawSceneNodes/markNodeDrawnOverGlassBackdrop';
import { releaseGlassBackdrop } from '../drawSceneNodes/releaseGlassBackdrop';
import { renderExportTarget, TRenderedNodePixels } from './renderExportTarget';
import { renderHoistedIds } from '../drawSceneNodes/renderHoistedIds';
import { renderIds } from '../drawSceneNodes/renderIds';

export const renderNodeSubtreeAtScale = (
  context: TDrawSceneContext,
  sourceNodeId: string,
  nodesById: Record<string, TSceneNode>,
  refs: TCanvasRefs,
  scale: number,
  boundsOverride?: TDraftRect,
): TRenderedNodePixels | null =>
  renderExportTarget(context, sourceNodeId, nodesById, scale, boundsOverride, (renderContext, target) => {
    const sceneNodeById = new Map(Object.entries(nodesById));
    const renderer: TMaskRenderer = {
      context: renderContext,
      gl: renderContext.gl,
      hoistedIds: getHoistedDragIds(refs, sceneNodeById),
      paintLeaf: (node, phase) => {
        drawLeafNode(renderContext, node, new Map(), refs, nodesById, null, 0, phase);
        markNodeDrawnOverGlassBackdrop(renderer, node);
      },
      // renderExportTarget already swapped renderContext.imageContext.renderTargetPool for one
      // sized to this export's own target, so reusing it here keeps every scratch allocation —
      // isolated-effect content and this renderer's own — pooled together, correctly sized.
      pool: renderContext.imageContext.renderTargetPool,
      refs,
      sceneNodeById,
    };

    renderIds(renderer, [sourceNodeId], target);
    renderHoistedIds(renderer);
    releaseGlassBackdrop(renderer);
  });
