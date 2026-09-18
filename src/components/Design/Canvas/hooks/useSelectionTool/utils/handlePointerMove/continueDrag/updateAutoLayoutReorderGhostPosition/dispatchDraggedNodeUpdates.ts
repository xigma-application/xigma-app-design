// store
import { selectImageEditor, selectNodes } from 'store/design/selectors';
import { updateNode } from 'store/design/slice';
import { AppDispatch, store } from 'store';

// types
import { TDragState, TNodeOrigin } from 'types/design/selectionTool/types';
import { TSceneNode } from 'types/design/types';
import { TVectorNodeDragSnapshot } from 'types/design/canvas/types';

// utils
import { getOriginalCropPaintChanges } from 'components/Design/Canvas/utils/getOriginalCropPaintChanges';
import { getDragOriginalFills } from '../dragOriginalFillsCache';
import { getGeometryDeltaChanges } from '../../../../../../utils/getGeometryDeltaChanges';
import { isAppearanceNode } from 'components/Design/RightPanel/PanelProperties/Common/AppearanceSection/types';
import { resyncGroupAutoLayoutAncestors } from '../../../handlePointerUp/resyncGroupAutoLayoutAncestors';
import { scheduleThrottledDispatch } from 'components/Design/Canvas/utils/scheduleThrottledDispatch';
import { translateFillsCrop } from 'components/Design/Canvas/utils/translateFillsCrop';

const updateDraggedNodeOrigin = (
  dispatch: AppDispatch,
  nodes: Record<string, TSceneNode>,
  id: string,
  origin: TNodeOrigin,
  deltaX: number,
  deltaY: number,
): void => {
  const node = nodes[id];
  const geometryChanges = getGeometryDeltaChanges(origin, deltaX, deltaY);
  const imageEditor = selectImageEditor(store.getState());
  const editedImageEditor = imageEditor?.nodeId === id ? imageEditor : null;
  const cropChanges =
    node && isAppearanceNode(node)
      ? getOriginalCropPaintChanges(node, getDragOriginalFills, editedImageEditor, (paints, skipIndex) =>
          translateFillsCrop(paints, deltaX, deltaY, skipIndex),
        )
      : {};

  dispatch(updateNode({ changes: { ...geometryChanges, ...cropChanges }, id }));
};

const dispatchNodeOriginUpdates = (
  dispatch: AppDispatch,
  nodeOrigins: Record<string, TNodeOrigin>,
  snapshots: Map<string, TVectorNodeDragSnapshot> | null,
  deltaX: number,
  deltaY: number,
): void => {
  const nodes = selectNodes(store.getState());

  Object.entries(nodeOrigins).forEach(([id, origin]) => {
    if (!snapshots?.has(id)) {
      updateDraggedNodeOrigin(dispatch, nodes, id, origin, deltaX, deltaY);
    }
  });
};

export const dispatchDraggedNodeUpdates = (
  dispatch: AppDispatch,
  dragState: TDragState,
  snapshots: Map<string, TVectorNodeDragSnapshot> | null,
  deltaX: number,
  deltaY: number,
): void => {
  scheduleThrottledDispatch(dragState.dispatchThrottle, () => {
    dispatchNodeOriginUpdates(dispatch, dragState.nodeOrigins, snapshots, deltaX, deltaY);
    resyncGroupAutoLayoutAncestors(dispatch, Object.keys(dragState.nodeOrigins));
  });
};
