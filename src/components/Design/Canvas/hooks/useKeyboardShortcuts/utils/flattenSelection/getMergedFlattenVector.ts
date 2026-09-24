// types
import { TFlattenEntry } from './types';
import { TVectorNode } from 'types/design/types';

// utils
import { computeFlattenVectorNode } from 'utils/canvas/flatten/computeFlattenVectorNode';
import { getNodePaintStyle } from 'store/design/utils/getNodePaintStyle';
import { getRenderedVectorNode } from 'utils/canvas/render/getRenderedVectorNode';

export const getMergedFlattenVector = (entries: TFlattenEntry[]): TVectorNode => {
  const { node: topNode } = entries[entries.length - 1];

  return computeFlattenVectorNode(
    { id: topNode.id, name: topNode.name, parentId: topNode.parentId },
    entries.map((entry) => getRenderedVectorNode(entry.vector)),
    getNodePaintStyle(topNode),
  );
};
