// hooks
import { useResizeToFitSelection } from 'components/Design/Menu/hooks/useResizeToFitSelection';

// store
import { selectSelectedNodes } from 'store/design/selectors';
import { useAppDispatch, useAppSelector } from 'store';

// utils
import { isFrameNode } from 'utils/canvas/signals/isFrameNode';
import { isFreeformFrame } from 'utils/canvas/signals/isFreeformFrame';
import { toggleFramesAutoLayout } from './utils/toggleFramesAutoLayout';

export type TUseLayoutSectionButtonsResult = {
  isAutoLayoutSelected: boolean;
  isResizeToFitVisible: boolean;
  onResizeToFit: TFunc;
  onToggleAutoLayout: TFunc;
};

export const useLayoutSectionButtons = (): TUseLayoutSectionButtonsResult => {
  const dispatch = useAppDispatch();
  const frames = useAppSelector(selectSelectedNodes).filter(isFrameNode);
  const onResizeToFit = useResizeToFitSelection();
  const isAutoLayoutSelected = frames.length > 0 && frames.every((frame) => !isFreeformFrame(frame));

  return {
    isAutoLayoutSelected,
    isResizeToFitVisible: frames.every(isFreeformFrame),
    onResizeToFit,
    onToggleAutoLayout: (): void => toggleFramesAutoLayout(dispatch, frames, isAutoLayoutSelected),
  };
};
