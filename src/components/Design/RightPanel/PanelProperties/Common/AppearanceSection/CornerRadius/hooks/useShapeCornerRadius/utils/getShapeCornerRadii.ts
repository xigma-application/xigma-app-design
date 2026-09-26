// types
import { NodeType } from 'types/design/enums';
import { TShapeOrVectorNode } from '../../../../../types';

// utils
import { getVectorCornerRadii } from 'utils/canvas/vectorNetwork/roundVectorCorners/getVectorCornerRadii';

export const getShapeCornerRadii = (node: TShapeOrVectorNode): number[] =>
  node.type === NodeType.vector ? getVectorCornerRadii(node, []) : [node.cornerRadius ?? 0];
