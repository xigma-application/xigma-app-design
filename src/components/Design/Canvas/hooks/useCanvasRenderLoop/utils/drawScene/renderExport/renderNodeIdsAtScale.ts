// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDraftRect } from 'types/canvas';
import { TDrawSceneContext } from '../types';
import { TSceneNode } from 'types/design/types';

// utils
import { buildExportMaskRenderer } from './buildExportMaskRenderer';
import { getTopLevelIds } from './getTopLevelIds';
import { releaseGlassBackdrop } from '../drawSceneNodes/releaseGlassBackdrop';
import { renderExportTarget, TRenderedNodePixels } from './renderExportTarget';
import { renderHoistedIds } from '../drawSceneNodes/renderHoistedIds';
import { renderIds } from '../drawSceneNodes/renderIds';

export const renderNodeIdsAtScale = (
  context: TDrawSceneContext,
  sourceNodeId: string,
  ids: string[],
  nodesById: Record<string, TSceneNode>,
  refs: TCanvasRefs,
  scale: number,
  boundsOverride?: TDraftRect,
): TRenderedNodePixels | null =>
  renderExportTarget(context, sourceNodeId, nodesById, scale, boundsOverride, (renderContext, target) => {
    const renderer = buildExportMaskRenderer(renderContext, nodesById, refs);

    renderIds(renderer, getTopLevelIds(ids, nodesById), target);
    renderHoistedIds(renderer);
    releaseGlassBackdrop(renderer);
  });
