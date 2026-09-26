// types
import { NodeType } from 'types/design/enums';
import { TDesignState } from '../../types';
import { TVectorNode } from 'types/design/types';

// utils
import { getActivePage } from '../getActivePage';
import { getVectorPaintToolFill } from 'utils/canvas/vectorNetwork/getVectorPaintToolFill';

export const setPaintToolFill = (state: TDesignState): void => {
  const page = getActivePage(state);
  const vectors = state.vectorEditingNodeIds
    .map((id) => page.nodes[id])
    .filter((node): node is TVectorNode => node?.type === NodeType.vector);

  page.paintFill = getVectorPaintToolFill(vectors);
};
