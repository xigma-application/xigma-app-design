// types
import { NodeType, StrokeAlign } from 'types/design/enums';
import { TStyledNode } from '../../../../AppearanceSection/types';
import { TFillTarget, TStrokeSettings } from './commitFills';
import { TVectorNode } from 'types/design/types';

const getTargetStrokeSettings = (node: TStyledNode | TVectorNode): TStrokeSettings => {
  switch (node.type) {
    case NodeType.line:
      return { strokeAlign: StrokeAlign.center, strokeWidth: node.strokeWidth };
    case NodeType.vector:
      return { strokeAlign: node.strokeAlign ?? StrokeAlign.center, strokeWidth: node.strokeWidth > 0 ? node.strokeWidth : undefined };
    default:
      return { strokeAlign: node.strokeAlign, strokeWidth: node.strokeWidth };
  }
};

export const getFillTargets = (nodes: (TStyledNode | TVectorNode)[]): TFillTarget[] =>
  nodes.map((node) => ({
    id: node.id,
    ...getTargetStrokeSettings(node),
    vector: node.type === NodeType.vector ? node : undefined,
  }));
