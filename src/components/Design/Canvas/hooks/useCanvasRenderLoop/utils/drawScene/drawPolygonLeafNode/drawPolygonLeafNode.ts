// types
import { EffectType } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDrawSceneContext } from '../types';
import { TPolygonNode, TSceneNode } from 'types/design/types';
import { TPaint } from 'types/design/paint/types';
import { TPathOutlineStyle } from '../getPathOutlineStyles';

// utils
import { drawBooleanEffects } from '../drawBooleanLeafNode/drawBooleanEffects';
import { drawBoxPaints } from '../drawBoxLeafNode/drawBoxPaints';
import { getPolygonShape } from './getPolygonShape';
import { getPolygonStrokeShapes } from 'utils/canvas/shapes/getPolygonStrokeShapes';

export const drawPolygonLeafNode = (
  context: TDrawSceneContext,
  node: TPolygonNode,
  opacity: number,
  nodesById: Record<string, TSceneNode>,
  pathOutlineStyles: Map<string, TPathOutlineStyle>,
  refs: TCanvasRefs,
  editingPathId: string | null | undefined,
  patternSourceDepth: number,
): void => {
  const shape = getPolygonShape(node);
  const strokeShapes = node.strokes?.length ? getPolygonStrokeShapes(node) : null;

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
