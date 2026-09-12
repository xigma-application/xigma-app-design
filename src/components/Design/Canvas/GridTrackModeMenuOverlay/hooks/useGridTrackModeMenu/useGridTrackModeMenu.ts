import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

// shared
import { TVirtualAnchor } from 'shared';

// store
import { store, useAppDispatch, useAppSelector } from 'store';
import { selectGridTrackModeMenuRequest, selectNodes, selectViewport } from 'store/design/selectors';
import { setGridTrackModeMenuRequest } from 'store/design/slice';

// types
import { SizingMode } from 'types/design/enums';
import { TGridTrackModeMenu } from './types';

// utils
import { commitGridTrackModeMenuChange } from './utils/commitGridTrackModeMenuChange';
import { getGridTrackModeMenuOptions } from '../../utils/getGridTrackModeMenuOptions';
import { getGridTrackModeMenuTarget, TGridTrackModeMenuTarget } from 'utils/canvas/gridSlots/getGridTrackModeMenuTarget';
import { worldToScreen } from 'components/Design/Canvas/utils/worldToScreen';

export const useGridTrackModeMenu = (): TGridTrackModeMenu => {
  const { t } = useTranslation();
  const request = useAppSelector(selectGridTrackModeMenuRequest);
  const viewport = useAppSelector(selectViewport);
  const dispatch = useAppDispatch();
  const anchorRef = useRef<TVirtualAnchor>({ getBoundingClientRect: (): DOMRect => new DOMRect() });
  const [target, setTarget] = useState<TGridTrackModeMenuTarget | null>(null);

  useEffect(() => {
    const resolved = request ? getGridTrackModeMenuTarget(request, selectNodes(store.getState()), viewport.zoom) : null;

    if (resolved) {
      const screen = worldToScreen(resolved.anchor, viewport);
      anchorRef.current = { getBoundingClientRect: (): DOMRect => new DOMRect(screen.x, screen.y, 0, 0) };
    }

    setTarget(resolved);

    if (request && !resolved) {
      dispatch(setGridTrackModeMenuRequest(null));
    }
  }, [dispatch, request, viewport]);

  const onOpenChange = useCallback(
    (open: boolean): void => {
      if (!open) {
        dispatch(setGridTrackModeMenuRequest(null));
      }
    },
    [dispatch],
  );

  const onSelectMode = useCallback(
    (mode: SizingMode): void => {
      if (target) {
        commitGridTrackModeMenuChange(dispatch, store.getState(), target, mode);
      }

      dispatch(setGridTrackModeMenuRequest(null));
    },
    [dispatch, target],
  );

  const options = target ? getGridTrackModeMenuOptions(t, target.axis, target.resolvedSize, target.trackValue) : [];

  return { anchorRef, isOpen: target !== null, mode: target?.mode ?? null, onOpenChange, onSelectMode, options };
};
