// types
import { TDesignState } from '../types';
import { NodeType } from 'types/design/enums';
import { TTextNode, TVectorNode } from 'types/design/types';

// utils
import { getActivePage } from './getActivePage';
import { getRenderedVectorNode } from 'components/Design/Canvas/utils/getRenderedVectorNode';
import { getVectorNodeBounds } from 'utils/canvas/vectorNetwork/getVectorNodeBounds';

export const syncPathTextNodesFromVector = (state: TDesignState, vectorNode: TVectorNode): void => {
  const boundTextNodes = Object.values(getActivePage(state).nodes).filter(
    (node): node is TTextNode => node.type === NodeType.text && node.pathId === vectorNode.id,
  );

  if (boundTextNodes.length > 0) {
    const bounds = getVectorNodeBounds(getRenderedVectorNode(vectorNode));

    boundTextNodes.forEach((node) => {
      node.height = bounds.height;
      node.rotation = 0;
      node.width = bounds.width;
      node.x = bounds.x;
      node.y = bounds.y;
    });
  }
};
