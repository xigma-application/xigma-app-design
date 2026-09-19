import { RefObject, useContext, useRef, useState } from 'react';

// components
import StrokeBrushPicker from '../StrokeBrushPicker/StrokeBrushPicker';
import { StrokeSettingsDockedPanelContext } from '../../StrokeSettingsDockedPanelContext';

// hooks
import { useCloseBrushPickerOnOutsideClick } from './useCloseBrushPickerOnOutsideClick';

export type TUseStrokeBrushPickerResult = {
  isPickerOpen: boolean;
  onTogglePicker: TFunc;
  triggerRef: RefObject<HTMLButtonElement | null>;
};

export const useStrokeBrushPicker = (brush: string, onBrushSelect: TFunc<[string]>): TUseStrokeBrushPickerResult => {
  const setDockedPanel = useContext(StrokeSettingsDockedPanelContext);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const originalBrushRef = useRef(brush);

  const previewBrush = (nextBrush: string): void => {
    onBrushSelect(nextBrush);
  };

  const revertPreview = (): void => {
    onBrushSelect(originalBrushRef.current);
  };

  const cancelPicker = (): void => {
    revertPreview();
    setDockedPanel?.(null);
    setIsPickerOpen(false);
  };

  const handleSelect = (nextBrush: string): void => {
    onBrushSelect(nextBrush);
    setDockedPanel?.(null);
    setIsPickerOpen(false);
  };

  const openPicker = (): void => {
    originalBrushRef.current = brush;
    setDockedPanel?.(
      <StrokeBrushPicker
        onClose={cancelPicker}
        onOptionHoverEnd={revertPreview}
        onOptionHoverStart={previewBrush}
        onSelect={handleSelect}
        ref={pickerRef}
        selectedBrushId={brush}
      />,
    );
    setIsPickerOpen(true);
  };

  useCloseBrushPickerOnOutsideClick(triggerRef, pickerRef, isPickerOpen, cancelPicker);

  return {
    isPickerOpen,
    onTogglePicker: isPickerOpen ? cancelPicker : openPicker,
    triggerRef,
  };
};
