// store
import { selectNodes } from 'store/design/selectors';
import { updateNode } from 'store/design/slice';
import { AppDispatch, store } from 'store';

// types
import { TCanvasRefs, TVectorNodeRotateSnapshot } from 'types/design/canvas/types';
import { TPoint } from 'types/canvas';
import { TRotateDragState, TRotateNodeOrigin } from 'types/design/selectionTool/types';
import { TSceneNode } from 'types/design/types';

// utils
import { getRotatedNodeChanges } from '../handlePointerMove/continueRotateDrag/getRotatedNodeChanges';
import { isAppearanceNode } from 'components/Design/RightPanel/PanelProperties/Common/AppearanceSection/types';
import { rotateFillsCrop } from 'components/Design/Canvas/utils/rotateFillsCrop';

const commitRotatedVectorNodeSnapshot = (
  dispatch: AppDispatch,
  nodes: Record<string, TSceneNode>,
  id: string,
  origin: TRotateNodeOrigin,
  pivot: TPoint,
  deltaDegrees: number,
  isSingleNodeRotate: boolean,
): void => {
  const node = nodes[id];
  const nodeChanges = getRotatedNodeChanges(origin, pivot, deltaDegrees, isSingleNodeRotate);
  const fills = node && isAppearanceNode(node) ? rotateFillsCrop(node.fills, pivot, deltaDegrees) : undefined;

  dispatch(updateNode({ changes: fills ? { ...nodeChanges, fills } : nodeChanges, id }));
};

const commitRotatedVectorNodeSnapshotEntries = (
  dispatch: AppDispatch,
  nodes: Record<string, TSceneNode>,
  snapshots: Map<string, TVectorNodeRotateSnapshot>,
  rotateDragState: TRotateDragState,
  isSingleNodeRotate: boolean,
): void => {
  snapshots.forEach((snapshot, id) => {
    const origin = rotateDragState.nodeOrigins[id];

    if (origin) {
      commitRotatedVectorNodeSnapshot(dispatch, nodes, id, origin, rotateDragState.pivot, snapshot.deltaDegrees, isSingleNodeRotate);
    }
  });
};

export const commitRotatedVectorNodeSnapshots = (
  dispatch: AppDispatch,
  rotateDragState: TRotateDragState,
  canvasRefs: TCanvasRefs,
): void => {
  const snapshots = canvasRefs.vectorSnapshots.rotatedVectorNodeSnapshotsRef.current;

  if (snapshots) {
    const isSingleNodeRotate = Object.keys(rotateDragState.nodeOrigins).length === 1;
    const nodes = selectNodes(store.getState());

    commitRotatedVectorNodeSnapshotEntries(dispatch, nodes, snapshots, rotateDragState, isSingleNodeRotate);
    canvasRefs.vectorSnapshots.rotatedVectorNodeSnapshotsRef.current = null;
  }
};
