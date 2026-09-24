// types
import { TAppearanceNode } from '../../../../AppearanceSection/types';
import { TFillTarget } from './commitFills';

export const getFillTargets = (nodes: TAppearanceNode[]): TFillTarget[] =>
  nodes.map((node) => ({ id: node.id, strokeAlign: node.strokeAlign, strokeWidth: node.strokeWidth }));
