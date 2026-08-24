// hooks
import { TKeyMap } from 'hooks';

// others
import { NUDGE_STEP, NUDGE_STEP_LARGE } from 'components/Design/Canvas/constants';
import { shortcuts } from '../shortcuts';

// store
import { AppDispatch } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';

// utils
import { createNudgeKeyMap } from './createNudgeKeyMap';

export const nudgeMap = (dispatch: AppDispatch, refs: TCanvasRefs): TKeyMap[] => [
  createNudgeKeyMap(dispatch, refs, -NUDGE_STEP, 0, shortcuts.nudgeLeft),
  createNudgeKeyMap(dispatch, refs, NUDGE_STEP, 0, shortcuts.nudgeRight),
  createNudgeKeyMap(dispatch, refs, 0, -NUDGE_STEP, shortcuts.nudgeUp),
  createNudgeKeyMap(dispatch, refs, 0, NUDGE_STEP, shortcuts.nudgeDown),
  createNudgeKeyMap(dispatch, refs, -NUDGE_STEP_LARGE, 0, shortcuts.nudgeLeftLarge),
  createNudgeKeyMap(dispatch, refs, NUDGE_STEP_LARGE, 0, shortcuts.nudgeRightLarge),
  createNudgeKeyMap(dispatch, refs, 0, -NUDGE_STEP_LARGE, shortcuts.nudgeUpLarge),
  createNudgeKeyMap(dispatch, refs, 0, NUDGE_STEP_LARGE, shortcuts.nudgeDownLarge),
];
