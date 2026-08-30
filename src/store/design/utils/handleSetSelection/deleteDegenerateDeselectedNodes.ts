// types
import { TDesignState } from '../../types';

// utils
import { handleDeleteNode } from '../handleDeleteNode/handleDeleteNode';
import { isEmptyVectorNode } from '../isEmptyVectorNode';
import { isFullyCutAwayEllipse } from './isFullyCutAwayEllipse';

export const deleteDegenerateDeselectedNodes = (state: TDesignState, deselectedIds: string[]): void => {
  deselectedIds
    .filter((id) => isFullyCutAwayEllipse(state, id) || isEmptyVectorNode(state, id))
    .forEach((id) => handleDeleteNode(state, id));
};
