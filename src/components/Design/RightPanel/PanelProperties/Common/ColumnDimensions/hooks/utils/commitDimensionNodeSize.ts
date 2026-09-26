// store
import { AppDispatch } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TBoxSceneNode, TVectorNode } from 'types/design/types';

// utils
import { commitNodeDimension } from './commitNodeDimension';
import { getLockedDimensionsChanges } from '../../utils/getLockedDimensionsChanges';
import { getVectorNodeBounds } from 'utils/canvas/vectorNetwork/getVectorNodeBounds';
import { resizeVectorToDimensions } from 'components/Design/RightPanel/PanelProperties/Vector/VectorDimensions/utils/resizeVectorToDimensions';

export const commitDimensionNodeSize = (
  dispatch: AppDispatch,
  node: TBoxSceneNode | TVectorNode,
  axis: 'height' | 'width',
  value: number,
): void => {
  if (node.type === NodeType.vector) {
    const bounds = getVectorNodeBounds(node);

    resizeVectorToDimensions(
      dispatch,
      node,
      getLockedDimensionsChanges(axis, value, bounds.width, bounds.height, node.lockedAspectRatio ?? false),
    );
  } else {
    commitNodeDimension(dispatch, node, axis, value);
  }
};
