// types
import { TCanvasRefs } from 'types/design/canvas/types';

// utils
import { isSmartSelectionSwapDragActive } from '../isSmartSelectionSwapDragActive';

const refs = (drag: unknown): TCanvasRefs => ({ smartSelection: { swapDragRef: { current: drag } } }) as unknown as TCanvasRefs;

describe('isSmartSelectionSwapDragActive', () => {
  it('should be true only while a swap drag is running', () => {
    // result
    expect(isSmartSelectionSwapDragActive(refs({}))).toBe(true);
    expect(isSmartSelectionSwapDragActive(refs(null))).toBe(false);
  });
});
