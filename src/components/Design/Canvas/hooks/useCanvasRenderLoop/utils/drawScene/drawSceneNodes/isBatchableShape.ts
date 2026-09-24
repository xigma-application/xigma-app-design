// others
import { ELLIPSE_DEFAULT_ARC_ANGLE } from 'constant/canvas';

// types
import { NodeType } from 'types/design/enums';
import { TBatchShape } from 'utils/canvas/drawRectBatch/types';
import { TEllipseNode, TRectangleNode, TSceneNode } from 'types/design/types';

// utils
import { getFaceGroupBlendMode } from '../drawVectorNodeOrTextPathGuide/drawSceneVectorNode/getFaceGroupBlendMode';
import { hasBatchableStroke } from './hasBatchableStroke';
import { hasEllipseArc } from 'utils/canvas/ellipseArc/hasEllipseArc';

const batchableByNode = new WeakMap<TBatchShape, boolean>();

const hasNoStroke = (node: TRectangleNode): boolean => !node.strokeWidth || (!node.strokeColor && !node.strokes?.length);

const hasNoEffects = (node: TRectangleNode): boolean => !node.effects?.length;

const isBatchableRectangle = (node: TRectangleNode): boolean =>
  Array.isArray(node.fills) &&
  (hasNoStroke(node) || hasBatchableStroke(node)) &&
  hasNoEffects(node) &&
  node.fills.every((paint) => paint.type === 'solid') &&
  !getFaceGroupBlendMode(node.fills);

const isBatchableEllipse = (node: TEllipseNode): boolean =>
  typeof node.fill === 'string' &&
  !(node.strokeColor && node.strokeWidth) &&
  !hasEllipseArc(node.arcStartAngle ?? ELLIPSE_DEFAULT_ARC_ANGLE, node.arcEndAngle ?? ELLIPSE_DEFAULT_ARC_ANGLE) &&
  (node.arcRatio ?? 0) <= 0;

const compute = (node: TBatchShape): boolean => (node.type === NodeType.ellipse ? isBatchableEllipse(node) : isBatchableRectangle(node));

export const isBatchableShape = (node: TSceneNode): node is TBatchShape => {
  if (node.type === NodeType.rectangle || node.type === NodeType.ellipse) {
    const cached = batchableByNode.get(node);

    if (cached === undefined) {
      const isBatchable = compute(node);
      batchableByNode.set(node, isBatchable);

      return isBatchable;
    }

    return cached;
  }

  return false;
};
