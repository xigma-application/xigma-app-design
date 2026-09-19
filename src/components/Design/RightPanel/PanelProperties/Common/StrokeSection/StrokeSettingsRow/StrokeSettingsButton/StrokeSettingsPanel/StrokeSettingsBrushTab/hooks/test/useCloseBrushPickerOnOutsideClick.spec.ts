import { renderHook } from '@testing-library/react';
import { RefObject } from 'react';

// hooks
import { useCloseBrushPickerOnOutsideClick } from '../useCloseBrushPickerOnOutsideClick';

const dispatchMouseDown = (target: Node): void => {
  const event = new MouseEvent('mousedown', { bubbles: true });

  Object.defineProperty(event, 'target', { value: target });
  window.dispatchEvent(event);
};

describe('useCloseBrushPickerOnOutsideClick', () => {
  it('should close when the click lands outside both the trigger and the picker', () => {
    // before
    const trigger = document.createElement('button');
    const picker = document.createElement('div');
    const outside = document.createElement('div');
    const onClose = vi.fn();
    const triggerRef = { current: trigger } as RefObject<HTMLElement | null>;
    const pickerRef = { current: picker } as RefObject<HTMLElement | null>;

    renderHook(() => useCloseBrushPickerOnOutsideClick(triggerRef, pickerRef, true, onClose));

    // action
    dispatchMouseDown(outside);

    // result
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should not close when the click lands on the trigger or inside the picker', () => {
    // before
    const trigger = document.createElement('button');
    const picker = document.createElement('div');
    const pickerChild = document.createElement('span');

    picker.appendChild(pickerChild);

    const onClose = vi.fn();
    const triggerRef = { current: trigger } as RefObject<HTMLElement | null>;
    const pickerRef = { current: picker } as RefObject<HTMLElement | null>;

    renderHook(() => useCloseBrushPickerOnOutsideClick(triggerRef, pickerRef, true, onClose));

    // action
    dispatchMouseDown(trigger);
    dispatchMouseDown(pickerChild);

    // result
    expect(onClose).not.toHaveBeenCalled();
  });

  it('should not listen at all while closed', () => {
    // before
    const trigger = document.createElement('button');
    const picker = document.createElement('div');
    const outside = document.createElement('div');
    const onClose = vi.fn();
    const triggerRef = { current: trigger } as RefObject<HTMLElement | null>;
    const pickerRef = { current: picker } as RefObject<HTMLElement | null>;

    renderHook(() => useCloseBrushPickerOnOutsideClick(triggerRef, pickerRef, false, onClose));

    // action
    dispatchMouseDown(outside);

    // result
    expect(onClose).not.toHaveBeenCalled();
  });
});
