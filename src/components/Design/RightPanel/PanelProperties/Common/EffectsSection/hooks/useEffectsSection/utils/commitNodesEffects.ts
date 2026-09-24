// store
import { AppDispatch } from 'store/store';
import { updateNode, updateNodes } from 'store/design/slice';

// types
import { TAppearanceNode } from '../../../../AppearanceSection/types';
import { TEffect } from 'types/design/types';

export const commitNodesEffects = (dispatch: AppDispatch, nodes: TAppearanceNode[], getEffects: TFunc<[TEffect[]], TEffect[]>): void => {
  const updates = nodes.map((node) => ({ changes: { effects: getEffects(node.effects ?? []) }, id: node.id }));

  if (updates.length === 1) {
    dispatch(updateNode(updates[0]));
  } else if (updates.length > 1) {
    dispatch(updateNodes(updates));
  }
};
