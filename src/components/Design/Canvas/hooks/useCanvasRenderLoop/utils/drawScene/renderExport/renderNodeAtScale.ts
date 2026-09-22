// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDraftRect } from 'types/canvas';
import { TDrawSceneContext } from '../types';
import { TSceneNode } from 'types/design/types';

// utils
import { drawLeafNode } from '../drawLeafNode';
import { renderExportTarget, TRenderedNodePixels } from './renderExportTarget';

export const renderNodeAtScale = (
  context: TDrawSceneContext,
  sourceNodeId: string,
  nodesToDraw: TSceneNode[],
  nodesById: Record<string, TSceneNode>,
  refs: TCanvasRefs,
  scale: number,
  boundsOverride?: TDraftRect,
): TRenderedNodePixels | null =>
  renderExportTarget(context, sourceNodeId, nodesById, scale, boundsOverride, (renderContext) => {
    nodesToDraw.forEach((node) => {
      drawLeafNode(renderContext, node, new Map(), refs, nodesById, null, 0);
    });
  });
