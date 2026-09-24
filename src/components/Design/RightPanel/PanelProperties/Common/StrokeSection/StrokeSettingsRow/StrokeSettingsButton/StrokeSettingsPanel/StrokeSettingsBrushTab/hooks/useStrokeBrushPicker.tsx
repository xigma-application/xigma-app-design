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

export const useStrokeBrushPicker = (
  brush: string | undefined,
  onBrushPreview: TFunc<[string]>,
  onBrushRevert: TFunc,
  onBrushCommit: TFunc<[string]>,
): TUseStrokeBrushPickerResult => {
  const setDockedPanel = useContext(StrokeSettingsDockedPanelContext);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  const cancelPicker = (): void => {
    onBrushRevert();
    setDockedPanel?.(null);
    setIsPickerOpen(false);
  };

  const handleSelect = (nextBrush: string): void => {
    onBrushCommit(nextBrush);
    setDockedPanel?.(null);
    setIsPickerOpen(false);
  };

  const openPicker = (): void => {
    setDockedPanel?.(
      <StrokeBrushPicker
        onClose={cancelPicker}
        onOptionHoverEnd={onBrushRevert}
        onOptionHoverStart={onBrushPreview}
        onSelect={handleSelect}
        ref={pickerRef}
        selectedBrushId={brush ?? ''}
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
