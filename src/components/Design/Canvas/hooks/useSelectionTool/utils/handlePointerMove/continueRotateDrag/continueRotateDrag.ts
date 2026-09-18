import { RefObject } from 'react';

// store
import { selectImageEditor, selectNodes, selectViewport } from 'store/design/selectors';
import { updateNode } from 'store/design/slice';
import { AppDispatch, store } from 'store';

// types
import { TCanvasRefs, TVectorNodeRotateSnapshot } from 'types/design/canvas/types';
import { TPoint } from 'types/canvas';
import { TRotateDragState, TRotateNodeOrigin } from 'types/design/selectionTool/types';
import { TSceneNode } from 'types/design/types';

// utils
import { getAngleBetweenPoints } from 'utils/math/getAngleBetweenPoints';
import { getPointerPosition } from 'utils/math/pointer/getPointerPosition';
import { getRotatedNodeChanges } from './getRotatedNodeChanges';
import { getRotatedCursorUrl } from 'utils/canvas/createCursorRotator/getRotatedCursorUrl';
import { getOriginalCropPaintChanges } from 'components/Design/Canvas/utils/getOriginalCropPaintChanges';
import { getRotateOriginalFills } from './rotateOriginalFillsCache';
import { isAppearanceNode } from 'components/Design/RightPanel/PanelProperties/Common/AppearanceSection/types';
import { pinRotatedGroupBounds } from './pinRotatedGroupBounds';
import { rotateFillsCrop } from 'components/Design/Canvas/utils/rotateFillsCrop';
import { screenToWorld } from 'utils/transform/screenToWorld';

const seedRotatedNodeIds = (canvasRefs: TCanvasRefs, snapshots: Map<string, TVectorNodeRotateSnapshot> | null): void => {
  if (snapshots && !canvasRefs.transform.rotatedNodeIdsRef.current) {
    canvasRefs.transform.rotatedNodeIdsRef.current = new Set(snapshots.keys());
  }
};

const updateRotatedNodeOrigin = (
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
  const imageEditor = selectImageEditor(store.getState());
  const editedImageEditor = imageEditor?.mode === 'crop' && imageEditor.nodeId === id ? imageEditor : null;
  const cropChanges =
    node && isAppearanceNode(node)
      ? getOriginalCropPaintChanges(node, getRotateOriginalFills, editedImageEditor, (paints, skipIndex) =>
          rotateFillsCrop(paints, pivot, deltaDegrees, skipIndex),
        )
      : {};

  dispatch(updateNode({ changes: { ...nodeChanges, ...cropChanges }, id }));
};

const updateRotatedNodeOrigins = (
  dispatch: AppDispatch,
  nodes: Record<string, TSceneNode>,
  nodeOrigins: Record<string, TRotateNodeOrigin>,
  snapshots: Map<string, TVectorNodeRotateSnapshot> | null,
  pivot: TPoint,
  deltaDegrees: number,
  isSingleNodeRotate: boolean,
): void => {
  Object.entries(nodeOrigins).forEach(([id, origin]) => {
    const snapshot = snapshots?.get(id);

    if (snapshot) {
      snapshot.deltaDegrees = deltaDegrees;
    } else {
      updateRotatedNodeOrigin(dispatch, nodes, id, origin, pivot, deltaDegrees, isSingleNodeRotate);
    }
  });
};

export const continueRotateDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  rotateDragRef: RefObject<TRotateDragState | null>,
  canvasRefs: TCanvasRefs,
): void => {
  const rotateDragState = rotateDragRef.current;

  if (rotateDragState) {
    const { cursorAngle, nodeOrigins, pivot, startAngle } = rotateDragState;
    const point = screenToWorld(getPointerPosition(canvas, event), selectViewport(store.getState()));
    const deltaDegrees = getAngleBetweenPoints(pivot, point) - startAngle;
    const isSingleNodeRotate = Object.keys(nodeOrigins).length === 1;
    const snapshots = canvasRefs.vectorSnapshots.rotatedVectorNodeSnapshotsRef.current;
    const nodes = selectNodes(store.getState());

    canvas.style.cursor = getRotatedCursorUrl('rotate', cursorAngle + deltaDegrees) ?? canvas.style.cursor;
    seedRotatedNodeIds(canvasRefs, snapshots);
    updateRotatedNodeOrigins(dispatch, nodes, nodeOrigins, snapshots, pivot, deltaDegrees, isSingleNodeRotate);
    pinRotatedGroupBounds(dispatch, nodeOrigins);
  }
};
