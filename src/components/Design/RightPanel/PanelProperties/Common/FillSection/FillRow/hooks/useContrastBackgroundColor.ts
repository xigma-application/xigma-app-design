// store
import { selectBackgroundPaint, selectNodes } from 'store/design/selectors';
import { useAppSelector } from 'store';

// utils
import { getContrastBackgroundColor } from '../utils/getContrastBackgroundColor';

export const useContrastBackgroundColor = (nodeId: string | undefined): string => {
  const nodesById = useAppSelector(selectNodes);
  const backgroundPaint = useAppSelector(selectBackgroundPaint);

  return getContrastBackgroundColor(nodeId, nodesById, backgroundPaint.color);
};
