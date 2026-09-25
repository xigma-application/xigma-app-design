// types
import { TDraftRect } from 'types/canvas';
import { TSceneNode, TStarNode } from 'types/design/types';

// utils
import { drawSvgStarShape } from './drawSvgStarShape';
import { getEffectiveOpacity } from 'components/Design/Canvas/hooks/useCanvasRenderLoop/utils/drawScene/getEffectiveOpacity';

export const drawSvgSimpleShape = (elements: string[], node: TStarNode, nodesById: Record<string, TSceneNode>, bounds: TDraftRect): void =>
  drawSvgStarShape(elements, node, getEffectiveOpacity(node, nodesById), bounds);
