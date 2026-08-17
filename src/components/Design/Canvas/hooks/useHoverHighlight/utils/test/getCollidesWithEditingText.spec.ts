// types
import { TEditingTextBox } from 'types/canvas';

// utils
import { getCollidesWithEditingText } from '../getCollidesWithEditingText';
import { getEditingCaretHit } from '../getEditingCaretHit';

vi.mock('../getEditingCaretHit', () => ({ getEditingCaretHit: vi.fn() }));

const POINT = { x: 10, y: 20 };
const BOX: TEditingTextBox = { flipX: false, flipY: false, height: 100, rotation: 0, width: 300, x: 0, y: 0 };

describe('getCollidesWithEditingText', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return false when nothing is being edited (no caret hit at all)', () => {
    // mock
    vi.mocked(getEditingCaretHit).mockReturnValue(null);

    // result
    expect(getCollidesWithEditingText(null, '', POINT, 1)).toBe(false);
  });

  it('should return true when the caret hit distance is within tolerance', () => {
    // mock — STRAIGHT_TEXT_HIT_TOLERANCE_PX is 8, at zoom 1 that stays 8 world units
    vi.mocked(getEditingCaretHit).mockReturnValue({ distance: 8, index: 0 });

    // result
    expect(getCollidesWithEditingText(BOX, 'Hi', POINT, 1)).toBe(true);
  });

  it('should return false when the caret hit distance exceeds tolerance', () => {
    // mock
    vi.mocked(getEditingCaretHit).mockReturnValue({ distance: 8.01, index: 0 });

    // result
    expect(getCollidesWithEditingText(BOX, 'Hi', POINT, 1)).toBe(false);
  });

  it('should widen the tolerance in world units as the viewport zooms out', () => {
    // mock — 15 world units exceeds the tolerance at zoom 1 (8) but not at zoom 0.5 (16)
    vi.mocked(getEditingCaretHit).mockReturnValue({ distance: 15, index: 0 });

    // result
    expect(getCollidesWithEditingText(BOX, 'Hi', POINT, 1)).toBe(false);
    expect(getCollidesWithEditingText(BOX, 'Hi', POINT, 0.5)).toBe(true);
  });

  it('should forward the box, content and point to getEditingCaretHit unchanged', () => {
    // mock
    vi.mocked(getEditingCaretHit).mockReturnValue(null);

    // before
    getCollidesWithEditingText(BOX, 'Hi', POINT, 1);

    // result
    expect(getEditingCaretHit).toHaveBeenCalledWith(BOX, 'Hi', POINT);
  });
});
