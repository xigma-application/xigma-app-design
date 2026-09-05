import { MouseEvent, useState } from 'react';

// hooks
import { TUseContextMenuResult, useContextMenu } from 'shared/UI/Tree/hooks/useContextMenu';

// store
import { selectOrderedNodes, selectSelectedIds, selectVectorEditingNodeIds, selectViewport } from 'store/design/selectors';
import { setSelection } from 'store/design/slice';
import { store, useAppDispatch } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TSceneNode } from 'types/design/types';

// utils
import { getPointerPosition } from 'utils/math/pointer/getPointerPosition';
import { getSelectionHitAtPoint } from '../useSelectionTool/utils/handlePointerDown/getSelectionHitAtPoint/getSelectionHitAtPoint';
import { screenToWorld } from 'utils/transform/screenToWorld';

export type TUseCanvasContextMenuResult = TUseContextMenuResult & {
  hitNode: TSceneNode | null;
};

export const useCanvasContextMenu = (refs: TCanvasRefs): TUseCanvasContextMenuResult => {
  const dispatch = useAppDispatch();
  const [hitNode, setHitNode] = useState<TSceneNode | null>(null);
  const { onContextMenu: openContextMenu, ...contextMenu } = useContextMenu();

  const onContextMenu = (event: MouseEvent): void => {
    const canvas = refs.canvasRef.current;
    const state = store.getState();

    if (canvas && !event.shiftKey && selectVectorEditingNodeIds(state).length === 0) {
      const viewport = selectViewport(state);
      const point = screenToWorld(getPointerPosition(canvas, event.nativeEvent), viewport);
      const hit = getSelectionHitAtPoint(point, selectOrderedNodes(state), viewport);

      if (hit && !selectSelectedIds(state).includes(hit.id)) {
        dispatch(setSelection([hit.id]));
      }

      setHitNode(hit);
      openContextMenu(event);
    }
  };

  return { ...contextMenu, hitNode, onContextMenu };
};
