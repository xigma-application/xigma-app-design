// types
import { EffectType } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDrawSceneContext } from './types';
import { TLineNode, TSceneNode } from 'types/design/types';
import { TPathOutlineStyle } from './getPathOutlineStyles';

// utils
import { drawBooleanEffects } from './drawBooleanLeafNode/drawBooleanEffects';
import { drawBoxPaints } from './drawBoxLeafNode/drawBoxPaints';
import { getLineShape } from './getLineShape';
import { getLineStrokeBox } from 'utils/canvas/shapes/getLineStrokeBox';
import { getLineStrokePolygon } from 'utils/canvas/shapes/getLineStrokePolygon';

export const drawLineLeafNode = (
  context: TDrawSceneContext,
  node: TLineNode,
  opacity: number,
  nodesById: Record<string, TSceneNode>,
  pathOutlineStyles: Map<string, TPathOutlineStyle>,
  refs: TCanvasRefs,
  editingPathId: string | null | undefined,
  patternSourceDepth: number,
): void => {
  const polygon = getLineStrokePolygon(node);

  if (polygon) {
    const shape = getLineShape(polygon);

    drawBooleanEffects(context, node, shape, opacity, refs, EffectType.dropShadow);
    drawBoxPaints(
      context,
      getLineStrokeBox(node),
      node.strokes,
      [polygon],
      opacity,
      nodesById,
      pathOutlineStyles,
      refs,
      editingPathId,
      patternSourceDepth,
    );
    drawBooleanEffects(context, node, shape, opacity, refs, EffectType.innerShadow);
    drawBooleanEffects(context, node, shape, opacity, refs, EffectType.noise);
  }
};
