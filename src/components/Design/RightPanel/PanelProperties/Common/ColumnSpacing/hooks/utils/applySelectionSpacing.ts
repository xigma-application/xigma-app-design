// store
import { AppDispatch, store } from 'store';
import { selectNodes } from 'store/design/selectors';

// types
import { TSpacingAxis } from '../../types';

// utils
import { getAxisSpan } from '../../../PositionSection/ColumnAlignment/hooks/utils/getAxisSpan';
import { getRotatedNodeBounds } from 'components/Design/Canvas/utils/getRotatedNodeBounds';
import { translateNodeSubtree } from '../../../PositionSection/ColumnAlignment/hooks/utils/translateNodeSubtree';

export const applySelectionSpacing = (dispatch: AppDispatch, orderedIds: string[], axis: TSpacingAxis, gap: number): void => {
  orderedIds.reduce<number | null>((cursor, id) => {
    const nodes = selectNodes(store.getState());
    const node = nodes[id];

    if (node) {
      const span = getAxisSpan(getRotatedNodeBounds(node), axis);
      const start = cursor ?? span.start;
      const delta = start - span.start;

      translateNodeSubtree(dispatch, nodes, node, axis === 'horizontal' ? delta : 0, axis === 'vertical' ? delta : 0);

      return start + span.size + gap;
    }

    return cursor;
  }, null);
};
