import { RefObject } from 'react';
import { renderHook } from '@testing-library/react';

// hooks
import { useExitImageEditorOnPanelClick } from './useExitImageEditorOnPanelClick';

const RIGHT_PANEL_CLASS = '_RightPanel_4t7gn_1';

const dispatchMouseDown = (target: Element): void => {
  const event = new MouseEvent('mousedown', { bubbles: true });

  Object.defineProperty(event, 'target', { value: target });
  window.dispatchEvent(event);
};

const buildRightPanel = (): { fillList: HTMLElement; otherField: HTMLElement } => {
  const rightPanel = document.createElement('div');

  rightPanel.className = RIGHT_PANEL_CLASS;

  const fillList = document.createElement('div');
  const fillRow = document.createElement('div');
  const otherField = document.createElement('input');

  fillList.appendChild(fillRow);
  rightPanel.appendChild(fillList);
  rightPanel.appendChild(otherField);
  document.body.appendChild(rightPanel);

  return { fillList, otherField };
};

describe('useExitImageEditorOnPanelClick', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('should not attach a listener when neither the image editor nor a picker is active', () => {
    // mock
    const onExitImageEditor = vi.fn();
    const onClosePicker = vi.fn();
    const { fillList } = buildRightPanel();
    const containerRef: RefObject<HTMLElement | null> = { current: fillList };

    renderHook(() => useExitImageEditorOnPanelClick(containerRef, false, false, onExitImageEditor, onClosePicker));

    // action
    dispatchMouseDown(document.body);

    // result
    expect(onExitImageEditor).not.toHaveBeenCalled();
    expect(onClosePicker).not.toHaveBeenCalled();
  });

  it('should exit the image editor (not close the picker) on the first click when both are active, mirroring the canvas two-stage behavior', () => {
    // mock
    const onExitImageEditor = vi.fn();
    const onClosePicker = vi.fn();
    const { fillList, otherField } = buildRightPanel();
    const containerRef: RefObject<HTMLElement | null> = { current: fillList };

    renderHook(() => useExitImageEditorOnPanelClick(containerRef, true, true, onExitImageEditor, onClosePicker));

    // action
    dispatchMouseDown(otherField);

    // result
    expect(onExitImageEditor).toHaveBeenCalledTimes(1);
    expect(onClosePicker).not.toHaveBeenCalled();
  });

  it('should close the picker on a second click, once the image editor is already inactive (regression: clicking the right panel exited crop mode but a follow-up click never closed the still-open picker)', () => {
    // mock
    const onExitImageEditor = vi.fn();
    const onClosePicker = vi.fn();
    const { fillList, otherField } = buildRightPanel();
    const containerRef: RefObject<HTMLElement | null> = { current: fillList };

    renderHook(() => useExitImageEditorOnPanelClick(containerRef, false, true, onExitImageEditor, onClosePicker));

    // action
    dispatchMouseDown(otherField);

    // result
    expect(onClosePicker).toHaveBeenCalledTimes(1);
    expect(onExitImageEditor).not.toHaveBeenCalled();
  });

  it('should not close the picker when clicking inside the fill list itself', () => {
    // mock
    const onExitImageEditor = vi.fn();
    const onClosePicker = vi.fn();
    const { fillList } = buildRightPanel();
    const containerRef: RefObject<HTMLElement | null> = { current: fillList };

    renderHook(() => useExitImageEditorOnPanelClick(containerRef, false, true, onExitImageEditor, onClosePicker));

    // action
    dispatchMouseDown(fillList.firstElementChild!);

    // result
    expect(onClosePicker).not.toHaveBeenCalled();
  });

  it('should not fire for a click outside the right panel entirely (e.g. the canvas), leaving that to the canvas’s own exit handling', () => {
    // mock
    const onExitImageEditor = vi.fn();
    const onClosePicker = vi.fn();
    const { fillList } = buildRightPanel();
    const canvas = document.createElement('canvas');

    document.body.appendChild(canvas);

    const containerRef: RefObject<HTMLElement | null> = { current: fillList };

    renderHook(() => useExitImageEditorOnPanelClick(containerRef, true, true, onExitImageEditor, onClosePicker));

    // action
    dispatchMouseDown(canvas);

    // result
    expect(onExitImageEditor).not.toHaveBeenCalled();
    expect(onClosePicker).not.toHaveBeenCalled();
  });

  it('should stop listening once unmounted', () => {
    // mock
    const onExitImageEditor = vi.fn();
    const onClosePicker = vi.fn();
    const { fillList, otherField } = buildRightPanel();
    const containerRef: RefObject<HTMLElement | null> = { current: fillList };

    const { unmount } = renderHook(() => useExitImageEditorOnPanelClick(containerRef, false, true, onExitImageEditor, onClosePicker));

    // action
    unmount();
    dispatchMouseDown(otherField);

    // result
    expect(onClosePicker).not.toHaveBeenCalled();
  });
});
