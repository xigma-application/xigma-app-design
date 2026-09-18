// components
import { getCropPaintChanges } from 'components/Design/Canvas/utils/getCropPaintChanges';
import { getGeometryDeltaChanges } from 'components/Design/Canvas/utils/getGeometryDeltaChanges';
import { isAppearanceNode } from 'components/Design/RightPanel/PanelProperties/Common/AppearanceSection/types';
import { translateFillsCrop } from 'components/Design/Canvas/utils/translateFillsCrop';

// types
import { TNewSceneNode, TSceneNode } from 'types/design/types';

export const cloneNodeWithOffset = (node: TSceneNode, offsetX: number, offsetY: number): TNewSceneNode => {
  const clone = structuredClone(node);
  const changes = getGeometryDeltaChanges(node, offsetX, offsetY);
  const cropChanges = isAppearanceNode(clone) ? getCropPaintChanges(clone, (paints) => translateFillsCrop(paints, offsetX, offsetY)) : {};

  return { ...clone, ...changes, ...cropChanges } as TNewSceneNode;
};
