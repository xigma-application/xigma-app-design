// types
import { MouseButton } from 'types/enums';

export const useIgnoreMiddleClickInteractOutside = (onInteractOutside?: (event: Event) => void): ((event: Event) => void) => {
  return (event: Event): void => {
    const originalEvent = (event as CustomEvent<{ originalEvent?: PointerEvent }>).detail?.originalEvent;

    if (originalEvent?.button === MouseButton.middle) {
      event.preventDefault();
    } else {
      onInteractOutside?.(event);
    }
  };
};
