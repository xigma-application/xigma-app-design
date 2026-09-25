// types
import { EffectType } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDrawSceneContext } from '../types';
import { TEllipseNode, TSceneNode } from 'types/design/types';
import { TPaint } from 'types/design/paint/types';
import { TPathOutlineStyle } from '../getPathOutlineStyles';

// utils
import { drawBooleanEffects } from '../drawBooleanLeafNode/drawBooleanEffects';
import { drawBoxPaints } from '../drawBoxLeafNode/drawBoxPaints';
import { getEllipseShape } from './getEllipseShape';
import { getEllipseStrokeShapes } from 'utils/canvas/shapes/getEllipseStrokeShapes';

export const drawEllipseLeafNode = (
  context: TDrawSceneContext,
  node: TEllipseNode,
  opacity: number,
  nodesById: Record<string, TSceneNode>,
  pathOutlineStyles: Map<string, TPathOutlineStyle>,
  refs: TCanvasRefs,
  editingPathId: string | null | undefined,
  patternSourceDepth: number,
): void => {
  const shape = getEllipseShape(node);
  const strokeShapes = node.strokes?.length ? getEllipseStrokeShapes(node) : null;

  drawBooleanEffects(context, node, shape, opacity, refs, EffectType.dropShadow);
  drawBoxPaints(context, node, node.fills, shape.polygons, opacity, nodesById, pathOutlineStyles, refs, editingPathId, patternSourceDepth);
  drawBooleanEffects(context, node, shape, opacity, refs, EffectType.innerShadow);
  strokeShapes?.forEach(({ fillRule, polygons }) => {
    drawBoxPaints(
      context,
      node,
      node.strokes as TPaint[],
      polygons,
      opacity,
      nodesById,
      pathOutlineStyles,
      refs,
      editingPathId,
      patternSourceDepth,
      null,
      fillRule,
    );
  });
  drawBooleanEffects(context, node, shape, opacity, refs, EffectType.noise);
};
