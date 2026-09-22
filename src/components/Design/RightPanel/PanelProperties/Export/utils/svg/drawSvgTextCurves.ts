// others
import { MSDF_ATLAS_JSON } from 'constant/webgl/msdfAtlas';

// types
import { TDraftRect } from 'types/canvas';
import { TSceneNode, TTextNode } from 'types/design/types';

// utils
import { drawSvgVectorFills } from './drawSvgVectorFills';
import { getEffectiveOpacity } from 'components/Design/Canvas/hooks/useCanvasRenderLoop/utils/drawScene/getEffectiveOpacity';
import { getRenderedVectorNode } from 'utils/canvas/render/getRenderedVectorNode';
import { getTextFlattenVector } from 'utils/canvas/text/fontOutline/getTextFlattenVector';

export const drawSvgTextCurves = async (
  elements: string[],
  defs: string[],
  node: TTextNode,
  nodesById: Record<string, TSceneNode>,
  bounds: TDraftRect,
): Promise<void> => {
  const pathNode = node.pathId ? nodesById[node.pathId] : undefined;
  const vector = await getTextFlattenVector(MSDF_ATLAS_JSON, node, pathNode);

  if (vector) {
    const renderedNode = getRenderedVectorNode(vector);
    const opacity = getEffectiveOpacity(node, nodesById);

    await drawSvgVectorFills(elements, defs, renderedNode, opacity, bounds);
  }
};
