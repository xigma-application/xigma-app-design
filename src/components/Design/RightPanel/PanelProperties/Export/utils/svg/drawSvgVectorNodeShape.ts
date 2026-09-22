// types
import { TDraftRect } from 'types/canvas';
import { TSceneNode, TVectorNode } from 'types/design/types';

// utils
import { drawSvgVectorFills } from './drawSvgVectorFills';
import { drawSvgVectorRoundedCaps } from './drawSvgVectorRoundedCaps';
import { drawSvgVectorStroke } from './drawSvgVectorStroke';
import { getEffectiveOpacity } from 'components/Design/Canvas/hooks/useCanvasRenderLoop/utils/drawScene/getEffectiveOpacity';
import { getRenderedVectorNode } from 'utils/canvas/render/getRenderedVectorNode';

export const drawSvgVectorNodeShape = async (
  elements: string[],
  defs: string[],
  node: TVectorNode,
  nodesById: Record<string, TSceneNode>,
  bounds: TDraftRect,
): Promise<void> => {
  const renderedNode = getRenderedVectorNode(node);
  const opacity = getEffectiveOpacity(node, nodesById);

  await drawSvgVectorFills(elements, defs, renderedNode, opacity, bounds);

  drawSvgVectorStroke(elements, renderedNode, opacity, bounds);
  drawSvgVectorRoundedCaps(elements, renderedNode, opacity, bounds);
};
