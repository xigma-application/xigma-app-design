// types
import { NodeType } from 'types/design/enums';
import { TPaint, TPaintProperty } from 'types/design/paint/types';
import { TSelectionColorNode } from '../types';

// utils
import { getEffectiveVectorFill } from 'utils/canvas/vectorNetwork/getEffectiveVectorFill';
import { getNodePaints } from 'utils/design/paint/getNodePaints';

export const getSelectionColorSourcePaints = (node: TSelectionColorNode, property: TPaintProperty, faceKey?: string): TPaint[] =>
  node.type === NodeType.vector && faceKey !== undefined ? getEffectiveVectorFill(node, faceKey) : getNodePaints(node, property);
