// hooks
import { TKeyMap } from 'hooks';

// store
import { AppDispatch } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TShortcut } from '../types';

// utils
import { handleNudgeSelection } from './handleNudgeSelection';

export const createNudgeKeyMap = (
  dispatch: AppDispatch,
  refs: TCanvasRefs,
  deltaX: number,
  deltaY: number,
  shortcut: TShortcut,
): TKeyMap => ({
  action: (event): any => {
    event.preventDefault();
    handleNudgeSelection(dispatch, refs, deltaX, deltaY, event.altKey);
  },
  ...shortcut,
});
