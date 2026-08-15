import { RefObject, useEffect, useRef } from 'react';

// store
import { setActiveTool, setSelection } from 'store/design/slice';
import { selectActiveTool } from 'store/design/selectors';
import { useAppDispatch, useAppSelector, useAppStore } from 'store';

// types
import { TArmedMedia } from './utils/loadArmedMedia';
import { TDraftEntity } from 'types/design/types';
import { ToolName } from 'types/design/enums';
import { TPoint } from 'types/canvas';

// utils
import { armNextFile } from './utils/armNextFile';
import { handlePointerDown } from './utils/handlePointerDown/handlePointerDown';
import { handlePointerMove } from './utils/handlePointerMove/handlePointerMove';
import { handlePointerUp } from './utils/handlePointerUp/handlePointerUp';

export type TMediaToolConfig = {
  name: string;
  tool: ToolName;
};

export const useDrawMediaTool = (
  canvasRef: RefObject<HTMLCanvasElement | null>,
  draftRef: RefObject<TDraftEntity | null>,
  { name, tool }: TMediaToolConfig,
): void => {
  const activeTool = useAppSelector(selectActiveTool);
  const dispatch = useAppDispatch();
  const appStore = useAppStore();
  const startRef = useRef<TPoint | null>(null);
  const armedRef = useRef<TArmedMedia | null>(null);
  const queueRef = useRef<File[]>([]);

  const handleFileChange = (event: Event): void => {
    dispatch(setSelection([]));
    queueRef.current = Array.from((event.target as HTMLInputElement).files ?? []);
    armNextFile(canvasRef, armedRef, queueRef);
  };

  const handleFileCancel = (): void => {
    dispatch(setActiveTool(ToolName.default));
  };

  useEffect(() => {
    const canvas = canvasRef.current;

    if (canvas && activeTool === tool) {
      const input = document.createElement('input');
      const onPointerDown = (event: PointerEvent): void => handlePointerDown(canvas, event, appStore, armedRef, startRef);
      const onPointerMove = (event: PointerEvent): void => handlePointerMove(canvas, event, appStore, armedRef, startRef, draftRef);
      const onPointerUp = (event: PointerEvent): void =>
        handlePointerUp(canvas, event, dispatch, appStore, canvasRef, armedRef, startRef, draftRef, queueRef, name);

      input.type = 'file';
      input.accept = 'image/*,video/*';
      input.multiple = true;
      input.addEventListener('change', handleFileChange);
      input.addEventListener('cancel', handleFileCancel);
      canvas.addEventListener('pointerdown', onPointerDown);
      canvas.addEventListener('pointermove', onPointerMove);
      canvas.addEventListener('pointerup', onPointerUp);
      input.click();

      return (): void => {
        input.removeEventListener('change', handleFileChange);
        input.removeEventListener('cancel', handleFileCancel);
        canvas.removeEventListener('pointerdown', onPointerDown);
        canvas.removeEventListener('pointermove', onPointerMove);
        canvas.removeEventListener('pointerup', onPointerUp);
        startRef.current = null;
        armedRef.current = null;
        queueRef.current = [];
        draftRef.current = null;
        canvas.style.cursor = '';
      };
    }
  }, [activeTool, appStore, canvasRef, dispatch, draftRef, name, tool]);
};
