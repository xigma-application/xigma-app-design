import { useCallback, useEffect, useRef, useState } from 'react';

// core
import { useClassNames } from '../../../core/ClassNamesProvider/hooks/useClassNames';

// store
import { deleteAllGuides, deleteGuide } from 'store/design/slice';
import { selectActiveTool } from 'store/design/selectors';
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

  useEffect(() => {
    refs.guides.selectedGuideRef.current = selectedGuide;
  }, [selectedGuide, refs]);

  useEffect(() => {
    const canvas = refs.canvasRef.current;

    if (canvas && (activeTool === ToolName.default || activeTool === ToolName.scale)) {
      const onPointerDown = (event: PointerEvent): void => handlePointerDown(canvas, event, dispatch, refs, setSelectedGuide, setRulerMenu);
      const onPointerMove = (event: PointerEvent): void => handlePointerMove(canvas, event, refs, setClassName);
      const onPointerUp = (event: PointerEvent): void => handlePointerUp(canvas, event, dispatch, refs);
      const onContextMenu = (event: MouseEvent): void => handleContextMenu(canvas, event, refs, openMenuAt, setRulerMenu, setSelectedGuide);

      canvas.addEventListener('pointerdown', onPointerDown);
      canvas.addEventListener('pointermove', onPointerMove);
      canvas.addEventListener('pointerup', onPointerUp);
      canvas.addEventListener('contextmenu', onContextMenu);

      return (): void => {
        canvas.removeEventListener('pointerdown', onPointerDown);
        canvas.removeEventListener('pointermove', onPointerMove);
        canvas.removeEventListener('pointerup', onPointerUp);
        canvas.removeEventListener('contextmenu', onContextMenu);
        refs.guides.draggingGuideRef.current = null;
        refs.guides.hoveredGuideRef.current = null;
        setClassName(null);
        setSelectedGuide(null);
        setRulerMenu(null);
      };
    }
  }, [activeTool, dispatch, openMenuAt, refs, setClassName]);

  return { anchorRef, isMenuOpen, onMenuOpenChange, removeAllGuides, removeSelectedGuide, rulerMenu, selectedGuide };
};
