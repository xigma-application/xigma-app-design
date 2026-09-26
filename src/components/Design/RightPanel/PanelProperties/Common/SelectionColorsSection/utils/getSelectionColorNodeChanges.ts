// types
import { TGradientPaint, TSolidPaint } from 'types/design/paint/types';
import { TSceneNode, TSceneNodeChanges } from 'types/design/types';
import { TSelectionColorOccurrence } from '../types';

// utils
import { getSelectionColorPaintsChange } from './getSelectionColorPaintsChange';
import { getSelectionColorSourcePaints } from './getSelectionColorSourcePaints';
import { groupOccurrencesByNodeProperty } from './groupOccurrencesByNodeProperty';
import { isSelectionColorNode } from './isSelectionColorNode';

export type TSelectionColorNodeChange = { changes: TSceneNodeChanges; nodeId: string };

export const getSelectionColorNodeChanges = (
  nodesById: Record<string, TSceneNode>,
  occurrences: TSelectionColorOccurrence[],
  nextPaint: TSolidPaint | TGradientPaint,
): TSelectionColorNodeChange[] => {
  const changesByNode = new Map<string, TSceneNodeChanges>();

  groupOccurrencesByNodeProperty(occurrences).forEach(({ faceKey, indices, nodeId, property }) => {
    const node = nodesById[nodeId];

    if (isSelectionColorNode(node)) {
      const previousChanges = changesByNode.get(nodeId);
      const paints = getSelectionColorSourcePaints(node, property, faceKey).map((paint, index) =>
        indices.has(index) ? { ...nextPaint, visible: paint.visible } : paint,
      );

      changesByNode.set(nodeId, { ...previousChanges, ...getSelectionColorPaintsChange(node, previousChanges, property, paints, faceKey) });
    }
  });

  return Array.from(changesByNode.entries()).map(([nodeId, changes]) => ({ changes, nodeId }));
};
