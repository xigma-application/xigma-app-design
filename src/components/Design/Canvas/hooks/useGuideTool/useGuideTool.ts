import { useCallback, useEffect, useRef, useState } from 'react';

// core
import { useClassNames } from '../../../core/ClassNamesProvider/hooks/useClassNames';

// store
import { deleteAllGuides, deleteGuide } from 'store/design/slice';
import { selectActiveTool, selectIsPatternSourcePicking } from 'store/design/selectors';
import { useAppDispatch, useAppSelector } from 'store';

// types
import { ToolName } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TPoint } from 'types/canvas';
import { TRulerMenu, TSelectedGuide, TUseGuideTool } from './types';
import { TVirtualAnchor } from 'shared';

// utils
import { handleContextMenu } from './utils/handleContextMenu';
import { handlePointerDown } from './utils/handlePointerDown/handlePointerDown';
import { handlePointerMove } from './utils/handlePointerMove/handlePointerMove';
import { handlePointerUp } from './utils/handlePointerUp/handlePointerUp';

export const useGuideTool = (refs: TCanvasRefs): TUseGuideTool => {
  const activeTool = useAppSelector(selectActiveTool);
  const isPatternSourcePicking = useAppSelector(selectIsPatternSourcePicking);
  const dispatch = useAppDispatch();
  const { setClassName } = useClassNames();
  const anchorRef = useRef<TVirtualAnchor>({ getBoundingClientRect: () => new DOMRect() });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [rulerMenu, setRulerMenu] = useState<TRulerMenu | null>(null);
  const [selectedGuide, setSelectedGuide] = useState<TSelectedGuide | null>(null);

  const openMenuAt = useCallback((point: TPoint): void => {
    anchorRef.current = { getBoundingClientRect: (): DOMRect => new DOMRect(point.x, point.y, 0, 0) };
    setTimeout(() => setIsMenuOpen(true), 0);
  }, []);

  const onMenuOpenChange = useCallback((open: boolean): void => {
    setIsMenuOpen(open);
  }, []);

  const removeAllGuides = useCallback((): void => {
    if (rulerMenu) {
      dispatch(deleteAllGuides({ axis: rulerMenu.axis }));
      setRulerMenu(null);
    }
  }, [dispatch, rulerMenu]);

  const removeSelectedGuide = useCallback((): void => {
    if (selectedGuide) {
      dispatch(deleteGuide({ frameId: selectedGuide.frameId, id: selectedGuide.id }));
      setSelectedGuide(null);
    }
  }, [dispatch, selectedGuide]);

  const onPointerDown = useCallback(
    (canvas: HTMLCanvasElement, event: PointerEvent): void => {
      if (!isPatternSourcePicking) {
        handlePointerDown(canvas, event, dispatch, refs, setSelectedGuide, setRulerMenu);
      }
    },
    [dispatch, isPatternSourcePicking, refs],
  );

  const onPointerMove = useCallback(
    (canvas: HTMLCanvasElement, event: PointerEvent): void => {
      if (!isPatternSourcePicking) {
        handlePointerMove(canvas, event, refs, setClassName);
      }
    },
    [isPatternSourcePicking, refs, setClassName],
  );

  const onPointerUp = useCallback(
    (canvas: HTMLCanvasElement, event: PointerEvent): void => handlePointerUp(canvas, event, dispatch, refs),
    [dispatch, refs],
  );

  const onContextMenu = useCallback(
    (canvas: HTMLCanvasElement, event: MouseEvent): void =>
      handleContextMenu(canvas, event, refs, openMenuAt, setRulerMenu, setSelectedGuide),
    [openMenuAt, refs],
  );

  useEffect(() => {
    refs.guides.selectedGuideRef.current = selectedGuide;
  }, [selectedGuide, refs]);

  useEffect(() => {
    const canvas = refs.canvasRef.current;

    if (canvas && (activeTool === ToolName.default || activeTool === ToolName.scale)) {
      const pointerDownListener = (event: PointerEvent): void => onPointerDown(canvas, event);
      const pointerMoveListener = (event: PointerEvent): void => onPointerMove(canvas, event);
      const pointerUpListener = (event: PointerEvent): void => onPointerUp(canvas, event);
      const contextMenuListener = (event: MouseEvent): void => onContextMenu(canvas, event);

      canvas.addEventListener('pointerdown', pointerDownListener);
      canvas.addEventListener('pointermove', pointerMoveListener);
      canvas.addEventListener('pointerup', pointerUpListener);
      canvas.addEventListener('contextmenu', contextMenuListener);

      return (): void => {
        canvas.removeEventListener('pointerdown', pointerDownListener);
        canvas.removeEventListener('pointermove', pointerMoveListener);
        canvas.removeEventListener('pointerup', pointerUpListener);
        canvas.removeEventListener('contextmenu', contextMenuListener);
        refs.guides.draggingGuideRef.current = null;
        refs.guides.hoveredGuideRef.current = null;
        setClassName(null);
        setSelectedGuide(null);
        setRulerMenu(null);
      };
    }
  }, [activeTool, onContextMenu, onPointerDown, onPointerMove, onPointerUp, refs, setClassName]);

  return { anchorRef, isMenuOpen, onMenuOpenChange, removeAllGuides, removeSelectedGuide, rulerMenu, selectedGuide };
};
