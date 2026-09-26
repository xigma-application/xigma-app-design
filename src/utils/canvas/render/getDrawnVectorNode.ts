// types
import { TVectorNode } from 'types/design/types';

// utils
import { getRenderedVectorNode } from './getRenderedVectorNode';
import { getRoundedVectorNode } from '../vectorNetwork/roundVectorCorners/getRoundedVectorNode';

export const getDrawnVectorNode = (node: TVectorNode): TVectorNode => getRoundedVectorNode(getRenderedVectorNode(node));
