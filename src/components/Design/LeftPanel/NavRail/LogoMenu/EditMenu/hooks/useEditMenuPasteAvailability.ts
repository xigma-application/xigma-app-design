// store
import { selectSelectedIds } from 'store/design/selectors';
import { useAppSelector } from 'store';

// utils
import { canReplaceSelectionWithClipboard } from 'components/Design/Canvas/hooks/useKeyboardShortcuts/utils/canReplaceSelectionWithClipboard';
import { getClipboardNodes } from 'components/Design/Canvas/hooks/useKeyboardShortcuts/utils/clipboard';

export const useEditMenuPasteAvailability = (): boolean => {
  const selectedIds = useAppSelector(selectSelectedIds);

  return canReplaceSelectionWithClipboard(selectedIds, getClipboardNodes().rootIds);
};
