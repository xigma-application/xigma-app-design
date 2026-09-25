// others
import { COUNT_MAX, COUNT_MIN } from '../../constants';

// store
import { AppDispatch } from 'store';
import { updateNode } from 'store/design/slice';

// types
import { TPolygonNode } from 'types/design/types';

// utils
import { clamp } from 'utils/math/clamp';
import { commitOnNodes } from '../../../utils/commitOnNodes';

export const commitPolygonCount = (dispatch: AppDispatch, nodes: TPolygonNode[], getValue: TFunc<[TPolygonNode], number>): void =>
  commitOnNodes(dispatch, nodes, (node) => {
    dispatch(updateNode({ changes: { sides: clamp(Math.round(getValue(node)), COUNT_MIN, COUNT_MAX) }, id: node.id }));
  });
