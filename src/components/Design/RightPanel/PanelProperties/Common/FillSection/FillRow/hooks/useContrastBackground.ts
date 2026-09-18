// store
import { selectBackgroundPaint, selectNodes } from 'store/design/selectors';
import { useAppSelector } from 'store';

// types
import { TContrastBackground } from '../types';

// utils
import { getContrastBackground } from '../utils/getContrastBackground';

export const useContrastBackground = (nodeId: string | undefined): TContrastBackground => {
  const nodesById = useAppSelector(selectNodes);
  const backgroundPaint = useAppSelector(selectBackgroundPaint);

  return getContrastBackground(nodeId, nodesById, backgroundPaint);
};
