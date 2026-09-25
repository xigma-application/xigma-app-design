// types
import { EffectType } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDrawSceneContext } from '../types';
import { TEllipseNode, TSceneNode } from 'types/design/types';
import { TPathOutlineStyle } from '../getPathOutlineStyles';

// utils
import { drawBooleanEffects } from '../drawBooleanLeafNode/drawBooleanEffects';
import { drawBoxPaints } from '../drawBoxLeafNode/drawBoxPaints';
import { drawThickEllipseOutline } from 'utils/canvas/shapes/drawThickEllipseOutline';
import { getBooleanStrokeColor } from 'utils/canvas/booleanOperation/getBooleanStrokeColor';
import { getEllipseShape } from './getEllipseShape';

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
  const { buffer, canvasHeight, canvasWidth, gl, program, viewport } = context;
  const shape = getEllipseShape(node);
  const strokeColor = getBooleanStrokeColor(node);

  drawBooleanEffects(context, node, shape, opacity, refs, EffectType.dropShadow);
  drawBoxPaints(context, node, node.fills, shape.polygons, opacity, nodesById, pathOutlineStyles, refs, editingPathId, patternSourceDepth);
  drawBooleanEffects(context, node, shape, opacity, refs, EffectType.innerShadow);
  drawBooleanEffects(context, node, shape, opacity, refs, EffectType.noise);

  if (strokeColor && node.strokeWidth) {
    drawThickEllipseOutline(
      gl,
      program,
      buffer,
      node,
      strokeColor,
      node.strokeWidth,
      canvasWidth,
      canvasHeight,
      viewport,
      node.rotation,
      node.strokeAlign,
    );
  }
};
