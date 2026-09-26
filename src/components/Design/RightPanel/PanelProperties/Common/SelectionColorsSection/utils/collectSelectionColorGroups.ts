import { uniqBy } from 'lodash';

// types
import { TFrameNode, TGroupNode, TSceneNode, TSectionNode, TVectorNode } from 'types/design/types';
import { TSelectionColorGroup, TSelectionColorOccurrence } from '../types';

// utils
import { getGroupSubtreeNodes } from 'store/design/utils/nodeHierarchy/getGroupSubtreeNodes';
import { getSelectionColorOccurrenceEntries } from './getSelectionColorOccurrenceEntries';
import { groupSelectionColorEntries } from './groupSelectionColorEntries';
import { isSelectionColorNode } from './isSelectionColorNode';

export const collectSelectionColorGroups = (
  nodes: (TFrameNode | TGroupNode | TSectionNode | TVectorNode)[],
  nodesById: Record<string, TSceneNode>,
  pinnedOccurrences: TSelectionColorOccurrence[] | null = null,
): TSelectionColorGroup[] =>
  groupSelectionColorEntries(
    getSelectionColorOccurrenceEntries(
      uniqBy(
        nodes.flatMap((node) => getGroupSubtreeNodes(node, nodesById)),
        'id',
      )
        .filter(isSelectionColorNode)
        .filter((colorNode) => !colorNode.hidden),
    ),
    pinnedOccurrences,
  );
