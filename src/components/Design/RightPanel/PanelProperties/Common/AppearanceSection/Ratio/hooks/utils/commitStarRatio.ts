// others
import { RATIO_MAX, RATIO_MIN } from '../../constants';

// store
import { AppDispatch } from 'store';
import { updateNode } from 'store/design/slice';

// types
import { TStarNode } from 'types/design/types';

// utils
import { clamp } from 'utils/math/clamp';
import { commitOnNodes } from '../../../utils/commitOnNodes';

export const commitStarRatio = (dispatch: AppDispatch, nodes: TStarNode[], getPercentage: TFunc<[TStarNode], number>): void =>
  commitOnNodes(dispatch, nodes, (node) => {
    const percentage = clamp(Math.round(getPercentage(node) * 10) / 10, RATIO_MIN, RATIO_MAX);

    dispatch(updateNode({ changes: { ratio: percentage / 100 }, id: node.id }));
  });
