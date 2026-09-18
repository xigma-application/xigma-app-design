// store
import { selectNodes } from 'store/design/selectors';
import { updateNode } from 'store/design/slice';
import { AppDispatch, store } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDragState } from 'types/design/selectionTool/types';

// utils
import { getCropPaintChanges } from 'components/Design/Canvas/utils/getCropPaintChanges';
import { getGeometryDeltaChanges } from 'components/Design/Canvas/utils/getGeometryDeltaChanges';
import { isAppearanceNode } from 'components/Design/RightPanel/PanelProperties/Common/AppearanceSection/types';
import { translateFillsCrop } from 'components/Design/Canvas/utils/translateFillsCrop';

export const commitDraggedVectorNodeSnapshots = (dispatch: AppDispatch, dragState: TDragState, canvasRefs: TCanvasRefs): void => {
  const snapshots = canvasRefs.vectorSnapshots.draggedVectorNodeSnapshotsRef.current;

  if (snapshots) {
    if (dragState.hasMoved) {
      const nodes = selectNodes(store.getState());

      snapshots.forEach((snapshot, id) => {
        const origin = dragState.nodeOrigins[id];

        if (origin) {
          const node = nodes[id];
          const geometryChanges = getGeometryDeltaChanges(origin, snapshot.deltaX, snapshot.deltaY);
          const cropChanges =
            node && isAppearanceNode(node)
              ? getCropPaintChanges(node, (paints) => translateFillsCrop(paints, snapshot.deltaX, snapshot.deltaY))
              : {};

          dispatch(updateNode({ changes: { ...geometryChanges, ...cropChanges }, id }));
        }
      });
    }

    canvasRefs.vectorSnapshots.draggedVectorNodeSnapshotsRef.current = null;
  }
};
