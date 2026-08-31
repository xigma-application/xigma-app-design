import { MouseEvent, RefObject, useRef, useState } from 'react';

export type TVirtualAnchor = { getBoundingClientRect: () => DOMRect };

export type TUseContextMenuResult = {
  anchorRef: RefObject<TVirtualAnchor>;
  isOpen: boolean;
  onContextMenu: TFunc<[MouseEvent]>;
  onOpenChange: TFunc<[boolean]>;
};

export const useContextMenu = (onOpen?: TFunc): TUseContextMenuResult => {
  const anchorRef = useRef<TVirtualAnchor>({ getBoundingClientRect: () => new DOMRect() });
  const [isOpen, setIsOpen] = useState(false);

  const onContextMenu = (event: MouseEvent): void => {
    const { clientX, clientY } = event;
    event.preventDefault();
    onOpen?.();

    anchorRef.current = { getBoundingClientRect: (): DOMRect => new DOMRect(clientX, clientY, 0, 0) };
    setTimeout(() => setIsOpen(true), 0);
  };

  const onOpenChange = (open: boolean): void => {
    setIsOpen(open);
  };

  return { anchorRef, isOpen, onContextMenu, onOpenChange };
};
