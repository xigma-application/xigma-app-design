import { PointerEvent, useEffect, useRef, useState } from 'react';

// others
import { MENU_SUB_HOVER_OPEN_DELAY_MS } from '../constants';

export type TUseDelayedSubOpenResult = {
  onOpenChange: (open: boolean) => void;
  onPointerEnter: (event: PointerEvent<HTMLDivElement>) => void;
  onPointerLeave: () => void;
  open: boolean;
};

export const useDelayedSubOpen = (disabled: boolean): TUseDelayedSubOpenResult => {
  const [open, setOpen] = useState(false);
  const openTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const clearOpenTimer = (): void => {
    clearTimeout(openTimerRef.current);
    openTimerRef.current = undefined;
  };

  useEffect(() => clearOpenTimer, []);

  const onPointerEnter = (event: PointerEvent<HTMLDivElement>): void => {
    if (disabled) {
      return;
    }

    const trigger = event.currentTarget;
    clearOpenTimer();
    openTimerRef.current = setTimeout(() => {
      trigger.focus({ preventScroll: true });
      setOpen(true);
    }, MENU_SUB_HOVER_OPEN_DELAY_MS);
  };

  return { onOpenChange: setOpen, onPointerEnter, onPointerLeave: clearOpenTimer, open };
};
