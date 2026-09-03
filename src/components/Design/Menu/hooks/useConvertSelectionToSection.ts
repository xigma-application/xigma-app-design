// store
import { useAppDispatch } from 'store';

// utils
import { handleConvertSelectionToSection } from 'components/Design/Canvas/hooks/useKeyboardShortcuts/utils/handleConvertSelectionToSection';

export const useConvertSelectionToSection = (): TFunc => {
  const dispatch = useAppDispatch();
  return (): void => handleConvertSelectionToSection(dispatch);
};
