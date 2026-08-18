import { RefObject } from 'react';

// store
import { setSelection } from 'store/design/slice';
import { AppDispatch } from 'store';

// types
import { TDragState } from 'types/design/selectionTool/types';
import { TPoint } from 'types/canvas';
import { TSceneNode } from 'types/design/types';

// utils
import { armDrag } from './armDrag';
import { isPointInGroupBounds } from '../isPointInGroupBounds';

export const armHitDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  dragStateRef: RefObject<TDragState | null>,
  hit: TSceneNode,
  currentSelection: string[],
  selectedNodes: TSceneNode[],
  point: TPoint,
): void => {
  const isPartOfMultiSelection = currentSelection.length > 1 && currentSelection.includes(hit.id);

  if (isPartOfMultiSelection || isPointInGroupBounds(point, selectedNodes)) {
    armDrag(currentSelection, { id: hit.id, kind: 'collapse' }, point, dragStateRef);
  } else {
    dispatch(setSelection([hit.id]));
    armDrag([hit.id], null, point, dragStateRef);
  }

  canvas.setPointerCapture(event.pointerId);
};
