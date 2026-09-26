// types
import { NodeType } from 'types/design/enums';
import { TPaint, TPaintProperty } from 'types/design/paint/types';
import { TSceneNodeChanges } from 'types/design/types';
import { TSelectionColorNode } from '../types';

// utils
import { getPaintsChange } from 'utils/design/paint/getPaintsChange';

export const getSelectionColorPaintsChange = (
  node: TSelectionColorNode,
  previousChanges: TSceneNodeChanges | undefined,
  property: TPaintProperty,
  paints: TPaint[],
  faceKey?: string,
): TSceneNodeChanges => {
  if (node.type === NodeType.vector && faceKey !== undefined) {
    const previousFillByKey = previousChanges && 'fillByKey' in previousChanges ? previousChanges.fillByKey : node.fillByKey;
    return { fillByKey: { ...previousFillByKey, [faceKey]: paints } };
  }

  return getPaintsChange(property, paints);
};
