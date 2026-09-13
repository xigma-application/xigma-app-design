import { Dispatch, SetStateAction, useLayoutEffect, useRef } from 'react';

// types
import { ColorPickerTab } from '../enums';

export const useResetActiveTabOnReopen = (
  openSessionId: number,
  initialActiveTab: ColorPickerTab | undefined,
  defaultActiveTab: ColorPickerTab,
  setActiveTab: Dispatch<SetStateAction<ColorPickerTab>>,
): void => {
  const initialActiveTabRef = useRef(initialActiveTab);
  const isFirstRunRef = useRef(true);

  initialActiveTabRef.current = initialActiveTab;

  useLayoutEffect(() => {
    if (isFirstRunRef.current) {
      isFirstRunRef.current = false;
    } else {
      setActiveTab(initialActiveTabRef.current ?? defaultActiveTab);
    }
  }, [defaultActiveTab, openSessionId, setActiveTab]);
};
