import { PointerEvent as ReactPointerEvent, useRef, useState } from 'react';

export type TPopoverDragOffset = { x: number; y: number };

export type TUsePopoverDragResult = {
  handleOpenChange: TFunc<[boolean]>;
  offset: TPopoverDragOffset;
  onPointerDown: TFunc<[ReactPointerEvent<HTMLDivElement>]>;
  onPointerMove: TFunc<[ReactPointerEvent<HTMLDivElement>]>;
  onPointerUp: TFunc<[ReactPointerEvent<HTMLDivElement>]>;
};

const INTERACTIVE_SELECTOR = 'button, input, textarea, select, a, [role="button"], [data-no-drag]';

type TDragStart = { originX: number; originY: number; startX: number; startY: number };

export const usePopoverDrag = (moveable: boolean, onOpenChange?: TFunc<[boolean]>): TUsePopoverDragResult => {
  const [offset, setOffset] = useState<TPopoverDragOffset>({ x: 0, y: 0 });
  const dragStartRef = useRef<TDragStart | null>(null);

  const handleOpenChange = (open: boolean): void => {
    if (moveable && open) {
      setOffset({ x: 0, y: 0 });
    }

    onOpenChange?.(open);
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>): void => {
    const target = event.target as HTMLElement;

    // a target rendered through its own portal (e.g. the color sampler's mask) still
    // bubbles this event here via React's tree, even though it isn't actually part of
    // this panel's own DOM surface — starting a drag for it would capture the pointer
    // onto this panel and steal its later pointerup/click from wherever it really landed.
    if (!event.currentTarget.contains(target)) {
      return;
    }

    if (!target.closest(INTERACTIVE_SELECTOR)) {
      event.currentTarget.setPointerCapture(event.pointerId);
      dragStartRef.current = { originX: offset.x, originY: offset.y, startX: event.clientX, startY: event.clientY };
    }
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>): void => {
    const dragStart = dragStartRef.current;

    if (dragStart && event.buttons === 1) {
      setOffset({
        x: dragStart.originX + (event.clientX - dragStart.startX),
        y: dragStart.originY + (event.clientY - dragStart.startY),
      });
    }
  };

  const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>): void => {
    dragStartRef.current = null;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  return { handleOpenChange, offset, onPointerDown, onPointerMove, onPointerUp };
};
