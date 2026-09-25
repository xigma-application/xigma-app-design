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
import { getLineStrokeShape } from 'utils/canvas/line/stroke/getLineStrokeShape';

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
  const strokeShape = getLineStrokeShape(node);

  if (strokeShape) {
    const shape = getLineShape(strokeShape);

    drawBooleanEffects(context, node, shape, opacity, refs, EffectType.dropShadow);
    drawBoxPaints(
      context,
      getLineStrokeBox(node),
      node.strokes,
      strokeShape.polygons,
      opacity,
      nodesById,
      pathOutlineStyles,
      refs,
      editingPathId,
      patternSourceDepth,
      null,
      strokeShape.fillRule,
    );
    drawBooleanEffects(context, node, shape, opacity, refs, EffectType.innerShadow);
    drawBooleanEffects(context, node, shape, opacity, refs, EffectType.noise);
  }
};
