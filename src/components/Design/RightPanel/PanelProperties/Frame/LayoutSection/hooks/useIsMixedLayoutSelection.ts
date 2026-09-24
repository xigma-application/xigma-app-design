// store
import { selectSelectedNodes } from 'store/design/selectors';
import { useAppSelector } from 'store';

// utils
import { getLayoutKey } from './utils/getLayoutKey';
import { isFrameNode } from 'utils/canvas/signals/isFrameNode';

export const useIsMixedLayoutSelection = (): boolean => {
  const frames = useAppSelector(selectSelectedNodes).filter(isFrameNode);
  return frames.some((frame) => getLayoutKey(frame) !== getLayoutKey(frames[0]));
};
