// others
import { EMPTY_VECTOR_SELECTION_SNAPSHOT } from 'store/history/constants';

// store
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';
import { selectSelectedNodes } from 'store/design/selectors';
import { toggleFrameClipContent, updateNode } from 'store/design/slice';
import { useAppDispatch, useAppSelector } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TFrameNode, TSceneNode } from 'types/design/types';

export type TUseColumnClipContentResult = {
  clipContent: boolean;
  isMixed: boolean;
  onChange: TFunc;
};

const isFrameNode = (node: TSceneNode | undefined): node is TFrameNode => node?.type === NodeType.frame;

export const useColumnClipContent = (): TUseColumnClipContentResult => {
  const dispatch = useAppDispatch();
  const frames = useAppSelector(selectSelectedNodes).filter(isFrameNode);
  const clipContent = frames.length > 0 && frames.every((frame) => frame.clipContent);
  const isMixed = !clipContent && frames.some((frame) => frame.clipContent);

  const onChange = (): void => {
    if (frames.length > 1) {
      dispatch(beginHistoryGesture(EMPTY_VECTOR_SELECTION_SNAPSHOT));
      frames.forEach((frame) => dispatch(updateNode({ changes: { clipContent: !clipContent }, id: frame.id })));
      dispatch(endHistoryGesture());
    } else {
      frames.forEach((frame) => dispatch(toggleFrameClipContent(frame.id)));
    }
  };

  return { clipContent, isMixed, onChange };
};
