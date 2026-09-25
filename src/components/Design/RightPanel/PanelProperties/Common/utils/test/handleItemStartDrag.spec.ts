import { PointerEvent as ReactPointerEvent } from 'react';

// utils
import { handleItemStartDrag } from '../handleItemStartDrag';

describe('handleItemStartDrag', () => {
  it('should close the panel and drag the selected items when the grabbed one is selected', () => {
    // mock
    const closeOpenPanel = vi.fn();
    const setSelectedIndices = vi.fn();
    const beginDrag = vi.fn();
    const event = {} as ReactPointerEvent;

    // before
    handleItemStartDrag(1, event, closeOpenPanel, [0, 1], setSelectedIndices, beginDrag);

    // result
    expect(closeOpenPanel).toHaveBeenCalled();
    expect(setSelectedIndices).not.toHaveBeenCalled();
    expect(beginDrag).toHaveBeenCalledWith([0, 1], 1, event);
  });

  it('should select and drag only the grabbed item when it is not selected', () => {
    // mock
    const setSelectedIndices = vi.fn();
    const beginDrag = vi.fn();
    const event = {} as ReactPointerEvent;

    // before
    handleItemStartDrag(2, event, vi.fn(), [0], setSelectedIndices, beginDrag);

    // result
    expect(setSelectedIndices).toHaveBeenCalledWith([2]);
    expect(beginDrag).toHaveBeenCalledWith([2], 2, event);
  });
});
