// store
import { AppDispatch } from 'store';
import { updateNode } from 'store/design/slice';

// types
import { TSceneNode } from 'types/design/types';

// utils
import { getCropPaintChanges } from './getCropPaintChanges';
import { getGeometryDeltaChanges } from './getGeometryDeltaChanges';
import { isAppearanceNode } from 'components/Design/RightPanel/PanelProperties/Common/AppearanceSection/types';
import { translateFillsCrop } from './translateFillsCrop';

export const translateNodes = (dispatch: AppDispatch, nodes: TSceneNode[], deltaX: number, deltaY: number): void => {
  nodes.forEach((node) => {
    const geometryChanges = getGeometryDeltaChanges(node, deltaX, deltaY);
    const cropChanges = isAppearanceNode(node) ? getCropPaintChanges(node, (paints) => translateFillsCrop(paints, deltaX, deltaY)) : {};

    dispatch(updateNode({ changes: { ...geometryChanges, ...cropChanges }, id: node.id }));
  });
};
