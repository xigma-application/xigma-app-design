import { useEffect, useRef, useState } from 'react';

// types
import { TImageFillPickerFocus } from 'store/design/types';

export const useClosePickerWhenFocusMovesAway = (
  isImage: boolean,
  nodeId: string | undefined,
  paintIndex: number,
  isPickerOpen: boolean,
  isImageTabActive: boolean,
  imageFillPickerFocus: TImageFillPickerFocus | null,
): number | undefined => {
  const [forceCloseSignal, setForceCloseSignal] = useState<number | undefined>(undefined);
  const hadFocusRef = useRef(false);

  useEffect(() => {
    const isSelf =
      imageFillPickerFocus !== null && imageFillPickerFocus.nodeId === nodeId && imageFillPickerFocus.paintIndex === paintIndex;

    if (isSelf) {
      hadFocusRef.current = true;
    } else if (isImage && isPickerOpen && isImageTabActive && hadFocusRef.current) {
      hadFocusRef.current = false;
      setForceCloseSignal((currentSignal) => (currentSignal ?? 0) + 1);
    }
  }, [imageFillPickerFocus, isImage, isImageTabActive, isPickerOpen, nodeId, paintIndex]);

  return forceCloseSignal;
};
