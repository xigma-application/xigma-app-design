// store
import { AppDispatch, store } from 'store';
import { selectNodes } from 'store/design/selectors';

// types
import { TSceneNode } from 'types/design/types';
import { TSpacingAxis } from '../../types';

// utils
import { getSpacingGroupSpan } from './getSpacingGroupSpan';
import { translateNodeSubtree } from '../../../PositionSection/ColumnAlignment/hooks/utils/translateNodeSubtree';

export const applySelectionSpacing = (dispatch: AppDispatch, groupIds: string[][], axis: TSpacingAxis, gap: number): void => {
  groupIds.reduce<number | null>((cursor, ids) => {
    const group = ids.map((id) => selectNodes(store.getState())[id]).filter((node): node is TSceneNode => Boolean(node));

    if (group.length > 0) {
      const span = getSpacingGroupSpan(group, axis);
      const start = cursor ?? span.start;
      const delta = start - span.start;

      group.forEach((node) => {
        const nodes = selectNodes(store.getState());
        translateNodeSubtree(dispatch, nodes, nodes[node.id], axis === 'horizontal' ? delta : 0, axis === 'vertical' ? delta : 0);
      });

      return start + (span.end - span.start) + gap;
    }

    return cursor;
  }, null);
};
