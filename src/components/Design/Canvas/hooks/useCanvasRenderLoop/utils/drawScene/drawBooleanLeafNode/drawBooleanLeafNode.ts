// types
import { EffectType } from 'types/design/enums';
import { TBooleanNode, TSceneNode } from 'types/design/types';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDrawSceneContext } from '../types';
import { TPathOutlineStyle } from '../getPathOutlineStyles';

// utils
import { drawBooleanEffects } from './drawBooleanEffects';
import { drawBooleanStrokePaints } from './drawBooleanStrokePaints';
import { drawBoxPaints } from '../drawBoxLeafNode/drawBoxPaints';
import { getBooleanShape } from './getBooleanShape';
import { getBooleanVectorNode } from 'utils/canvas/booleanOperation/getBooleanVectorNode';
import { getFaceBufferCache } from 'utils/canvas/faceBufferCache/getFaceBufferCache';

export const drawBooleanLeafNode = (
  context: TDrawSceneContext,
  node: TBooleanNode,
  opacity: number,
  nodesById: Record<string, TSceneNode>,
  pathOutlineStyles: Map<string, TPathOutlineStyle>,
  refs: TCanvasRefs,
  editingPathId: string | null | undefined,
  patternSourceDepth: number,
): void => {
  const vector = getBooleanVectorNode(node, nodesById);

  if (vector) {
    const shape = getBooleanShape(vector);

    drawBooleanEffects(context, node, shape, opacity, refs, EffectType.dropShadow);
    drawBoxPaints(
      context,
      { ...shape.bounds, rotation: 0 },
      node.fills,
      shape.polygons,
      opacity,
      nodesById,
      pathOutlineStyles,
      refs,
      editingPathId,
      patternSourceDepth,
      getFaceBufferCache(context.gl),
    );
    drawBooleanEffects(context, node, shape, opacity, refs, EffectType.innerShadow);
    drawBooleanStrokePaints(context, node, shape, opacity, nodesById, pathOutlineStyles, refs, editingPathId, patternSourceDepth);
    drawBooleanEffects(context, node, shape, opacity, refs, EffectType.noise);
  }
};
