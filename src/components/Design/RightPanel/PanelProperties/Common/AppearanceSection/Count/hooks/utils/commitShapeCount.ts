// others
import { COUNT_MAX, COUNT_MIN } from '../../constants';

// store
import { AppDispatch } from 'store';
import { updateNode } from 'store/design/slice';

// types
import { NodeType } from 'types/design/enums';
import { TCountNode } from '../../types';

// utils
import { clamp } from 'utils/math/clamp';
import { commitOnNodes } from '../../../utils/commitOnNodes';

export const commitShapeCount = (dispatch: AppDispatch, nodes: TCountNode[], getValue: TFunc<[TCountNode], number>): void =>
  commitOnNodes(dispatch, nodes, (node) => {
    const count = clamp(Math.round(getValue(node)), COUNT_MIN, COUNT_MAX);

    dispatch(updateNode({ changes: node.type === NodeType.star ? { points: count } : { sides: count }, id: node.id }));
  });
