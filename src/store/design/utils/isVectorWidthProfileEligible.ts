// types
import { TVectorNode } from 'types/design/types';

// utils
import { getVectorChainOrder } from 'utils/canvas/vectorNetwork/getVectorChainOrder/getVectorChainOrder';

export const isVectorWidthProfileEligible = (node: TVectorNode): boolean => !node.widthProfile || getVectorChainOrder(node) !== null;
