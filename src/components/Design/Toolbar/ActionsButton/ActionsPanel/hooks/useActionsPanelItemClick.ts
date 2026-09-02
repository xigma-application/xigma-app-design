// core
import { useCanvasRefsContext } from 'components/App/core/CanvasRefsProvider/hooks/useCanvasRefsContext';

// others
import { handleSelectAll } from 'components/Design/Canvas/hooks/useKeyboardShortcuts/utils/handleSelectAll';
import { handleUndo } from 'components/Design/Canvas/hooks/useKeyboardShortcuts/utils/handleUndo';

// store
import { AppDispatch, useAppDispatch } from 'store';

// types
import { TActionsPanelAction } from '../types';
import { TCanvasRefs } from 'types/design/canvas/types';

const ACTION_HANDLERS: Record<TActionsPanelAction, TFunc<[AppDispatch, TCanvasRefs]>> = {
  selectAll: handleSelectAll,
  undo: handleUndo,
};

export const useActionsPanelItemClick = (): TFunc<[TActionsPanelAction | undefined]> => {
  const dispatch = useAppDispatch();
  const refs = useCanvasRefsContext();

  return (action) => {
    if (action) {
      ACTION_HANDLERS[action](dispatch, refs);
    }
  };
};
