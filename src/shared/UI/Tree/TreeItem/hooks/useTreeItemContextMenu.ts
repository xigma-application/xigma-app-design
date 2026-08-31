import { MouseEvent, RefObject, useRef, useState } from 'react';

// store
import { selectSelectedIds } from 'store/design/selectors';
import { setSelection } from 'store/design/slice';
import { useAppDispatch, useAppSelector } from 'store';

// utils
import { setSelectionAnchorId } from './useSelectTreeItem/utils/selectionAnchor';

export type TVirtualAnchor = { getBoundingClientRect: () => DOMRect };

export type TUseTreeItemContextMenuResult = {
  anchorRef: RefObject<TVirtualAnchor>;
  isOpen: boolean;
  onContextMenu: TFunc<[MouseEvent]>;
  onOpenChange: TFunc<[boolean]>;
};

export const useTreeItemContextMenu = (id: string): TUseTreeItemContextMenuResult => {
  const dispatch = useAppDispatch();
  const selectedIds = useAppSelector(selectSelectedIds);
  const anchorRef = useRef<TVirtualAnchor>({ getBoundingClientRect: () => new DOMRect() });
  const [isOpen, setIsOpen] = useState(false);

  const onContextMenu = (event: MouseEvent): void => {
    const { clientX, clientY } = event;
    event.preventDefault();

    if (!selectedIds.includes(id)) {
      setSelectionAnchorId(id);
      dispatch(setSelection([id]));
    }

    anchorRef.current = { getBoundingClientRect: (): DOMRect => new DOMRect(clientX, clientY, 0, 0) };
    setTimeout(() => setIsOpen(true), 0);
  };

  const onOpenChange = (open: boolean): void => {
    setIsOpen(open);
  };

  return { anchorRef, isOpen, onContextMenu, onOpenChange };
};
