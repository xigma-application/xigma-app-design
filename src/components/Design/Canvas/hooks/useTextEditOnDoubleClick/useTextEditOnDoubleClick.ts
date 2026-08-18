import { useEffect } from 'react';

// store
import { selectActiveTool, selectEditingTextBox, selectOrderedNodes, selectSelectedNodes, selectViewport } from 'store/design/selectors';
import { setSelection, startTextEdit } from 'store/design/slice';
import { store, useAppDispatch, useAppSelector } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { ToolName } from 'types/design/enums';

// utils
import { getDoubleClickedTextNode } from './utils/getDoubleClickedTextNode';
import { getPointerPosition } from '../../utils/getPointerPosition';
import { screenToWorld } from '../../utils/screenToWorld';

export const useTextEditOnDoubleClick = (refs: TCanvasRefs): void => {
  const { canvasRef } = refs;
  const activeTool = useAppSelector(selectActiveTool);
  const editingTextBox = useAppSelector(selectEditingTextBox);
  const dispatch = useAppDispatch();

  const handleDoubleClick = (canvas: HTMLCanvasElement, event: MouseEvent): void => {
    const state = store.getState();
    const viewport = selectViewport(state);
    const point = screenToWorld(getPointerPosition(canvas, event), viewport);
    const target = getDoubleClickedTextNode(point, selectOrderedNodes(state), selectSelectedNodes(state), viewport);

    if (target) {
      event.preventDefault();
      event.stopPropagation();
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
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;

    if (canvas && activeTool === ToolName.default && !editingTextBox) {
      const onDoubleClick = (event: MouseEvent): void => handleDoubleClick(canvas, event);

      canvas.addEventListener('dblclick', onDoubleClick);

      return (): void => canvas.removeEventListener('dblclick', onDoubleClick);
    }
  }, [activeTool, canvasRef, dispatch, editingTextBox]);
};
