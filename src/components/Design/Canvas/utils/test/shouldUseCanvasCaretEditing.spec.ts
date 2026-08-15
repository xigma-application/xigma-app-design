// types
import { TEditingTextBox } from 'types/canvas';

// utils
import { shouldUseCanvasCaretEditing } from '../shouldUseCanvasCaretEditing';

const BOX: TEditingTextBox = { flipX: false, flipY: false, height: 20, rotation: 0, width: 100, x: 0, y: 0 };

describe('shouldUseCanvasCaretEditing', () => {
  it('should return false when there is no editing box at all', () => {
    // result
    expect(shouldUseCanvasCaretEditing(null)).toBe(false);
  });

  it('should return true for a plain, unrotated, unflipped straight-text box, since pointer-events: none on the overlay means clicks always fall through to the canvas', () => {
    // result
    expect(shouldUseCanvasCaretEditing(BOX)).toBe(true);
  });

  it('should return true for a path-text box', () => {
    // result
    expect(shouldUseCanvasCaretEditing({ ...BOX, pathId: 'ellipse-1' })).toBe(true);
  });

  it('should return true for a rotated or flipped straight-text box', () => {
    // result
    expect(shouldUseCanvasCaretEditing({ ...BOX, rotation: 180 })).toBe(true);
  });
});
