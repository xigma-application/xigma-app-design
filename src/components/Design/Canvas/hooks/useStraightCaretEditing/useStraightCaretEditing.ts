import { useEffect, useRef } from 'react';

// store
import { selectEditingTextBox } from 'store/design/selectors';
import { useAppDispatch, useAppSelector } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TEditingTextBox } from 'types/canvas';

// utils
import { handleDoubleClick } from './utils/handleDoubleClick/handleDoubleClick';
import { handlePointerDown } from './utils/handlePointerDown/handlePointerDown';
import { handlePointerMove } from './utils/handlePointerMove/handlePointerMove';
import { handlePointerUp } from './utils/handlePointerUp/handlePointerUp';

const isEditingStraightBox = (box: TEditingTextBox | null): boolean => Boolean(box) && !box?.pathId;

export const useStraightCaretEditing = (refs: TCanvasRefs): void => {
  const { canvasRef } = refs;
  const dispatch = useAppDispatch();
  const editingTextBox = useAppSelector(selectEditingTextBox);
  const isActive = isEditingStraightBox(editingTextBox);
  const anchorIndexRef = useRef<number | null>(null);

  const onPointerDown = (canvas: HTMLCanvasElement, event: PointerEvent): void =>
    handlePointerDown(canvas, event, dispatch, anchorIndexRef);

  const onDoubleClick = (canvas: HTMLCanvasElement, event: MouseEvent): void => handleDoubleClick(canvas, event, dispatch, anchorIndexRef);

  const onPointerMove = (canvas: HTMLCanvasElement, event: PointerEvent): void =>
    handlePointerMove(canvas, event, dispatch, anchorIndexRef);

  const onPointerUp = (): void => handlePointerUp(anchorIndexRef);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (canvas && isActive) {
      const pointerDownListener = (event: PointerEvent): void => onPointerDown(canvas, event);
      const doubleClickListener = (event: MouseEvent): void => onDoubleClick(canvas, event);
      const pointerMoveListener = (event: PointerEvent): void => onPointerMove(canvas, event);

      document.addEventListener('pointerdown', pointerDownListener);
      document.addEventListener('dblclick', doubleClickListener);
      document.addEventListener('pointermove', pointerMoveListener);
      document.addEventListener('pointerup', onPointerUp);

      return (): void => {
        document.removeEventListener('pointerdown', pointerDownListener);
        document.removeEventListener('dblclick', doubleClickListener);
        document.removeEventListener('pointermove', pointerMoveListener);
        document.removeEventListener('pointerup', onPointerUp);
        anchorIndexRef.current = null;
      };
    }
  }, [canvasRef, dispatch, isActive]);
};
