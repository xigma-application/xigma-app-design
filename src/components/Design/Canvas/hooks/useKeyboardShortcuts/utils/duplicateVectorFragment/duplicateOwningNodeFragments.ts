// components
import { DUPLICATE_OFFSET } from 'components/Design/Canvas/constants';

// store
import { updateNode } from 'store/design/slice';
import { AppDispatch } from 'store';

// types
import { TVectorNode } from 'types/design/types';

// utils
import { extractVectorFragment } from '../extractVectorFragment/extractVectorFragment';
import { mergeClonedVectorFragment } from '../mergeClonedVectorFragment';

export const duplicateOwningNodeFragments = (
  dispatch: AppDispatch,
  owningNodesById: Map<string, TVectorNode>,
  selectedVertexIds: string[],
  selectedSegmentIds: string[],
): { newSegmentIds: string[]; newVertexIds: string[] } => {
  const newVertexIds: string[] = [];
  const newSegmentIds: string[] = [];

  owningNodesById.forEach((node) => {
    const fragment = extractVectorFragment(
      node,
      selectedVertexIds.filter((id) => id in node.vertices),
      selectedSegmentIds.filter((id) => id in node.segments),
    );
    const merged = mergeClonedVectorFragment(node, fragment, DUPLICATE_OFFSET, DUPLICATE_OFFSET);

    dispatch(updateNode({ changes: merged.changes, id: node.id }));
    newVertexIds.push(...merged.newVertexIds);
    newSegmentIds.push(...merged.newSegmentIds);
  });

  return { newSegmentIds, newVertexIds };
};
