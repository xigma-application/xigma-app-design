import { useCallback, useEffect, useState } from 'react';

// core
import { useClassNames } from '../../../core/ClassNamesProvider/hooks/useClassNames';

// store
import { deleteGuide } from 'store/design/slice';
import { selectActiveTool } from 'store/design/selectors';
import { useAppDispatch, useAppSelector } from 'store';

// types
import { ToolName } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TSelectedGuide, TUseGuideTool } from './types';

// utils
import { handlePointerDown } from './utils/handlePointerDown';
import { handlePointerMove } from './utils/handlePointerMove';
import { handlePointerUp } from './utils/handlePointerUp';

export const useGuideTool = (refs: TCanvasRefs): TUseGuideTool => {
  const activeTool = useAppSelector(selectActiveTool);
  const dispatch = useAppDispatch();
  const { setClassName } = useClassNames();
  const [selectedGuide, setSelectedGuide] = useState<TSelectedGuide | null>(null);

  useEffect(() => {
    const canvas = refs.canvasRef.current;

    if (canvas && (activeTool === ToolName.default || activeTool === ToolName.scale)) {
      const onPointerDown = (event: PointerEvent): void => {
        setSelectedGuide(null);
        handlePointerDown(canvas, event, dispatch, refs);
      };
      const onPointerMove = (event: PointerEvent): void => handlePointerMove(canvas, event, refs, setClassName);
      const onPointerUp = (event: PointerEvent): void => handlePointerUp(canvas, event, dispatch, refs, setSelectedGuide);

      canvas.addEventListener('pointerdown', onPointerDown);
      canvas.addEventListener('pointermove', onPointerMove);
      canvas.addEventListener('pointerup', onPointerUp);

      return (): void => {
        canvas.removeEventListener('pointerdown', onPointerDown);
        canvas.removeEventListener('pointermove', onPointerMove);
        canvas.removeEventListener('pointerup', onPointerUp);
        refs.guides.draggingGuideRef.current = null;
        setClassName(null);
        setSelectedGuide(null);
      };
    }
  }, [activeTool, dispatch, refs, setClassName]);

  const removeSelectedGuide = useCallback((): void => {
    if (selectedGuide) {
      dispatch(deleteGuide({ frameId: selectedGuide.frameId, id: selectedGuide.id }));
      setSelectedGuide(null);
    }
  }, [dispatch, selectedGuide]);

  return { removeSelectedGuide, selectedGuide };
};
