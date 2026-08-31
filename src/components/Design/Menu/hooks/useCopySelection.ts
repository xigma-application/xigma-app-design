// utils
import { copySelectedNodes } from 'components/Design/Canvas/hooks/useKeyboardShortcuts/utils/copySelectedNodes';

export const useCopySelection = (): TFunc => {
  return (): void => copySelectedNodes();
};
