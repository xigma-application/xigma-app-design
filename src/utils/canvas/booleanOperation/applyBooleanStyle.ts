// types
import { TBooleanNode, TVectorNode } from 'types/design/types';


export const applyBooleanStyle = (vector: TVectorNode, node: TBooleanNode): TVectorNode => ({
  ...vector,
  defaultFill: node.fills,
  fillByKey: Object.fromEntries(vector.filledFaceKeys.map((key) => [key, node.fills])),
  id: node.id,
  name: node.name,
  parentId: node.parentId,
  strokeWidth: (node.strokes ?? []).length > 0 ? (node.strokeWidth ?? 1) : 0,
  strokes: node.strokes ?? [],
});
