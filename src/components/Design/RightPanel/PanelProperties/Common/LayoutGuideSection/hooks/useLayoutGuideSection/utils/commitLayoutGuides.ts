// types
import { AppDispatch } from 'store/store';
import { TFrameNode, TLayoutGuide } from 'types/design/types';

// others
import { updateNode, updateNodes } from 'store/design/slice';

export const commitLayoutGuides = (
  dispatch: AppDispatch,
  nodes: TFrameNode[],
  getGuides: TFunc<[TLayoutGuide[]], TLayoutGuide[]>,
): void => {
  const updates = nodes.map((node) => ({ changes: { layoutGuides: getGuides(node.layoutGuides ?? []) }, id: node.id }));

  if (updates.length === 1) {
    dispatch(updateNode(updates[0]));
  } else if (updates.length > 1) {
    dispatch(updateNodes(updates));
  }
};
