// types
import { NodeType, StrokeAlign } from 'types/design/enums';
import { TStyledNode } from '../../../../AppearanceSection/types';
import { TFillTarget } from './commitFills';

export const getFillTargets = (nodes: TStyledNode[]): TFillTarget[] =>
  nodes.map((node) => ({
    id: node.id,
    strokeAlign: node.type === NodeType.line ? StrokeAlign.center : node.strokeAlign,
    strokeWidth: node.strokeWidth,
  }));
