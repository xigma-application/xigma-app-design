// types
import { NodeType, StrokeAlign } from 'types/design/enums';
import { TStyledNode } from '../../../../AppearanceSection/types';
import { TFillTarget } from './commitFills';
import { TVectorNode } from 'types/design/types';

export const getFillTargets = (nodes: (TStyledNode | TVectorNode)[]): TFillTarget[] =>
  nodes.map((node) => ({
    id: node.id,
    strokeAlign: node.type === NodeType.line ? StrokeAlign.center : node.strokeAlign,
    strokeWidth: node.strokeWidth,
    vector: node.type === NodeType.vector ? node : undefined,
  }));
