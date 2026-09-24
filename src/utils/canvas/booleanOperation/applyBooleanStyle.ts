// types
import { TBooleanNode, TVectorNode } from 'types/design/types';

// utils
import { getBooleanStrokeColor } from './getBooleanStrokeColor';

export const applyBooleanStyle = (vector: TVectorNode, node: TBooleanNode): TVectorNode => ({
  ...vector,
  defaultFill: node.fills,
  fillByKey: Object.fromEntries(vector.filledFaceKeys.map((key) => [key, node.fills])),
  id: node.id,
  name: node.name,
  parentId: node.parentId,
  strokeColor: getBooleanStrokeColor(node) ?? '',
  strokeWidth: getBooleanStrokeColor(node) ? (node.strokeWidth ?? 1) : 0,
});
