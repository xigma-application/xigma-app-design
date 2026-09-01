// hooks
import { useBringSelectionToFront } from './useBringSelectionToFront';
import { useCopySelection } from './useCopySelection';
import { useFlattenSelection } from './useFlattenSelection';
import { useFlipSelection } from './useFlipSelection';
import { useGroupSelection } from './useGroupSelection';
import { useMoveSelectionToPage } from './useMoveSelectionToPage';
import { useOutlineStrokeSelection } from './useOutlineStrokeSelection';
import { usePasteToReplace } from './usePasteToReplace';
import { useSendSelectionToBack } from './useSendSelectionToBack';
import { useUseSelectionAsMask } from './useUseSelectionAsMask';

// store
import { selectActivePageId, selectPages } from 'store/design/selectors';
import { useAppSelector } from 'store';

// types
import { TDesignPage } from 'store/design/types';

export type TNodeMenuActions = {
  onBringToFront: TFunc;
  onCopy: TFunc;
  onFlatten: TFunc;
  onFlipHorizontal: TFunc;
  onFlipVertical: TFunc;
  onGroupSelection: TFunc;
  onMoveToPage: TFunc<[string]>;
  onOutlineStroke: TFunc;
  onPasteToReplace: TFunc;
  onSendToBack: TFunc;
  onUseAsMask: TFunc;
  otherPages: TDesignPage[];
};

export const useNodeMenuActions = (): TNodeMenuActions => {
  const activePageId = useAppSelector(selectActivePageId);
  const pages = useAppSelector(selectPages);
  const otherPages = Object.values(pages).filter((page) => page.id !== activePageId);
  const onBringToFront = useBringSelectionToFront();
  const onCopy = useCopySelection();
  const onFlatten = useFlattenSelection();
  const onFlipSelection = useFlipSelection();
  const onGroupSelection = useGroupSelection();
  const onMoveToPage = useMoveSelectionToPage();
  const onOutlineStroke = useOutlineStrokeSelection();
  const onPasteToReplace = usePasteToReplace();
  const onSendToBack = useSendSelectionToBack();
  const onUseAsMask = useUseSelectionAsMask();

  return {
    onBringToFront,
    onCopy,
    onFlatten,
    onFlipHorizontal: onFlipSelection.onFlipHorizontal,
    onFlipVertical: onFlipSelection.onFlipVertical,
    onGroupSelection,
    onMoveToPage,
    onOutlineStroke,
    onPasteToReplace,
    onSendToBack,
    onUseAsMask,
    otherPages,
  };
};
