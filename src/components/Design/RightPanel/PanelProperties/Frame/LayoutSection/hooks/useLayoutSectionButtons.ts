// hooks
import { useResizeToFitSelection } from 'components/Design/Menu/hooks/useResizeToFitSelection';

// store
import { selectSelectedNodes } from 'store/design/selectors';
import { useAppDispatch, useAppSelector } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TFrameNode, TSceneNode } from 'types/design/types';

// utils
import { isFreeformFrame } from 'utils/canvas/signals/isFreeformFrame';
import { toggleFramesAutoLayout } from './utils/toggleFramesAutoLayout';

export type TUseLayoutSectionButtonsResult = {
  isAutoLayoutSelected: boolean;
  isResizeToFitVisible: boolean;
  onResizeToFit: TFunc;
  onToggleAutoLayout: TFunc;
};

const isFrameNode = (node: TSceneNode | undefined): node is TFrameNode => node?.type === NodeType.frame;

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
