// types
import { NodeType } from 'types/design/enums';
import { TPaint, TPaintProperty } from 'types/design/paint/types';
import { TStyledNode } from '../../../../AppearanceSection/types';
import { TVectorNode } from 'types/design/types';

// utils
import { getNodePaints } from 'utils/design/paint/getNodePaints';
import { getVectorPanelFills } from 'utils/canvas/vectorNetwork/getVectorPanelFills';

export const getPanelPaints = (node: TStyledNode | TVectorNode, property: TPaintProperty): TPaint[] | null =>
  node.type === NodeType.vector && property === 'fills' ? getVectorPanelFills(node) : getNodePaints(node, property);
