import { useEffect, useRef, useState } from 'react';

export type TUseOpenPickerIndexResult = { onPickerOpenChange: (index: number, isOpen: boolean) => void; openPickerIndex: number | null };

export const useOpenPickerIndex = (nodeId: string | undefined, initialIndex: number | null): TUseOpenPickerIndexResult => {
  const [openPickerIndex, setOpenPickerIndex] = useState<number | null>(initialIndex);
  const previousNodeIdRef = useRef(nodeId);

  useEffect(() => {
    if (previousNodeIdRef.current !== nodeId) {
      previousNodeIdRef.current = nodeId;
      setOpenPickerIndex(null);
    }
  }, [nodeId]);

  const onPickerOpenChange = (index: number, isOpen: boolean): void => {
    if (isOpen) {
      setOpenPickerIndex(index);
    } else {
      setOpenPickerIndex((currentIndex) => (currentIndex === index ? null : currentIndex));
    }
  };

  return { onPickerOpenChange, openPickerIndex };
};
