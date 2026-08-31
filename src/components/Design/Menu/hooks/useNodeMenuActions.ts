// hooks
import { useBringSelectionToFront } from './useBringSelectionToFront';
import { useCopySelection } from './useCopySelection';
import { useGroupSelection } from './useGroupSelection';
import { useMoveSelectionToPage } from './useMoveSelectionToPage';
import { usePasteToReplace } from './usePasteToReplace';
import { useSendSelectionToBack } from './useSendSelectionToBack';

// store
import { selectActivePageId, selectPages } from 'store/design/selectors';
import { useAppSelector } from 'store';

// types
import { TDesignPage } from 'store/design/types';

export type TNodeMenuActions = {
  onBringToFront: TFunc;
  onCopy: TFunc;
  onGroupSelection: TFunc;
  onMoveToPage: TFunc<[string]>;
  onPasteToReplace: TFunc;
  onSendToBack: TFunc;
  otherPages: TDesignPage[];
};

export const useNodeMenuActions = (): TNodeMenuActions => {
  const activePageId = useAppSelector(selectActivePageId);
  const pages = useAppSelector(selectPages);
  const otherPages = Object.values(pages).filter((page) => page.id !== activePageId);
  const onBringToFront = useBringSelectionToFront();
  const onCopy = useCopySelection();
  const onGroupSelection = useGroupSelection();
  const onMoveToPage = useMoveSelectionToPage();
  const onPasteToReplace = usePasteToReplace();
  const onSendToBack = useSendSelectionToBack();

  return { onBringToFront, onCopy, onGroupSelection, onMoveToPage, onPasteToReplace, onSendToBack, otherPages };
};
