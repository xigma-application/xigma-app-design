// others
import { CORNER_RADIUS_MAX, CORNER_RADIUS_MIN } from '../../../constants';

// store
import { AppDispatch } from 'store';
import { updateNode } from 'store/design/slice';

// types
import { TShapeNode } from '../../../../../types';

// utils
import { clamp } from 'utils/math/clamp';
import { commitOnNodes } from '../../../../utils/commitOnNodes';

export const commitShapeCornerRadius = (dispatch: AppDispatch, nodes: TShapeNode[], getValue: TFunc<[TShapeNode], number>): void =>
  commitOnNodes(dispatch, nodes, (node) => {
    dispatch(updateNode({ changes: { cornerRadius: clamp(getValue(node), CORNER_RADIUS_MIN, CORNER_RADIUS_MAX) }, id: node.id }));
  });
