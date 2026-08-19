// store
import { selectEditingTextBox, selectOrderedNodes, selectSelectedNodes, selectViewport } from 'store/design/selectors';
import { setSelection, startTextEdit } from 'store/design/slice';
import { RootState, useAppDispatch, useAppSelector } from 'store';

// hooks
import { useDoubleClickActivation } from '../useDoubleClickActivation/useDoubleClickActivation';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TTextNode } from 'types/design/types';
import { TPoint } from 'types/canvas';

// utils
import { getDoubleClickedTextNode } from './utils/getDoubleClickedTextNode';

export const useTextEditOnDoubleClick = (refs: TCanvasRefs): void => {
  const editingTextBox = useAppSelector(selectEditingTextBox);
  const dispatch = useAppDispatch();

  const getTarget = (point: TPoint, state: RootState): TTextNode | null =>
    getDoubleClickedTextNode(point, selectOrderedNodes(state), selectSelectedNodes(state), selectViewport(state));

  const handleHit = (target: TTextNode): void => {
    dispatch(setSelection([target.id]));
    dispatch(
      startTextEdit({
        box: {
          flipX: target.flipX,
          flipY: target.flipY,
          height: target.height,
          pathFlip: target.pathFlip,
          pathId: target.pathId,
          pathStartOffset: target.pathStartOffset,
          rotation: target.rotation,
          width: target.width,
          x: target.x,
          y: target.y,
        },
        content: target.content,
        id: target.id,
      }),
    );
  };

  useDoubleClickActivation(refs, Boolean(editingTextBox), getTarget, handleHit);
};
