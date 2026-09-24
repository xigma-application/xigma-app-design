import { uniqBy } from 'lodash';

// types
import { TFrameNode, TSceneNode } from 'types/design/types';
import { TSelectionColorGroup, TSelectionColorOccurrence } from '../types';

// utils
import { getGroupSubtreeNodes } from 'store/design/utils/nodeHierarchy/getGroupSubtreeNodes';
import { getSelectionColorOccurrenceEntries } from './getSelectionColorOccurrenceEntries';
import { groupSelectionColorEntries } from './groupSelectionColorEntries';
import { isAppearanceNode } from '../../AppearanceSection/types';

export const collectSelectionColorGroups = (
  nodes: TFrameNode[],
  nodesById: Record<string, TSceneNode>,
  pinnedOccurrences: TSelectionColorOccurrence[] | null = null,
): TSelectionColorGroup[] =>
  groupSelectionColorEntries(
    getSelectionColorOccurrenceEntries(
      uniqBy(
        nodes.flatMap((node) => getGroupSubtreeNodes(node, nodesById)),
        'id',
      )
        .filter(isAppearanceNode)
        .filter((appearanceNode) => !appearanceNode.hidden),
    ),
    pinnedOccurrences,
  );
