// types
import { TGradientPaint, TSolidPaint } from 'types/design/paint/types';
import { TSceneNode, TSceneNodeChanges } from 'types/design/types';
import { TSelectionColorOccurrence } from '../types';

// utils
import { getNodePaints } from 'utils/design/paint/getNodePaints';
import { getPaintsChange } from 'utils/design/paint/getPaintsChange';
import { groupOccurrencesByNodeProperty } from './groupOccurrencesByNodeProperty';
import { isAppearanceNode } from '../../AppearanceSection/types';

export type TSelectionColorNodeChange = { changes: TSceneNodeChanges; nodeId: string };

export const getSelectionColorNodeChanges = (
  nodesById: Record<string, TSceneNode>,
  occurrences: TSelectionColorOccurrence[],
  nextPaint: TSolidPaint | TGradientPaint,
): TSelectionColorNodeChange[] => {
  const changesByNode = new Map<string, TSceneNodeChanges>();

  groupOccurrencesByNodeProperty(occurrences).forEach(({ indices, nodeId, property }) => {
    const node = nodesById[nodeId];

    if (node && isAppearanceNode(node)) {
      const paints = getNodePaints(node, property).map((paint, index) =>
        indices.has(index) ? { ...nextPaint, visible: paint.visible } : paint,
      );

      changesByNode.set(nodeId, { ...changesByNode.get(nodeId), ...getPaintsChange(property, paints) });
    }
  });

  return Array.from(changesByNode.entries()).map(([nodeId, changes]) => ({ changes, nodeId }));
};
