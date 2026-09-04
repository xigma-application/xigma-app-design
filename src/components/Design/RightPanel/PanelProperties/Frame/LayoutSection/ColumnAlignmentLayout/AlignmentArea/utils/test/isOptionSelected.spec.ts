// utils
import { isOptionSelected } from '../isOptionSelected';

// types
import { AlignmentLayout } from 'types/design/enums';

describe('isOptionSelected', () => {
  it('should only select the exact value when not in gap-auto vertical mode', () => {
    // result
    expect(isOptionSelected(AlignmentLayout.left, AlignmentLayout.topLeft, false, false, false)).toBe(false);
    expect(isOptionSelected(AlignmentLayout.topLeft, AlignmentLayout.topLeft, false, false, false)).toBe(true);
  });

  it('should select the whole column when isGapAutoVertical is true on a vertical frame', () => {
    // result
    expect(isOptionSelected(AlignmentLayout.left, AlignmentLayout.topLeft, true, false, false)).toBe(true);
    expect(isOptionSelected(AlignmentLayout.bottomLeft, AlignmentLayout.topLeft, true, false, false)).toBe(true);
    expect(isOptionSelected(AlignmentLayout.center, AlignmentLayout.topLeft, true, false, false)).toBe(false);
  });

  it('should ignore isGapAutoHorizontal on a vertical frame', () => {
    // result
    expect(isOptionSelected(AlignmentLayout.left, AlignmentLayout.topLeft, false, true, false)).toBe(false);
  });

  it('should only select the exact value when not in gap-auto horizontal mode', () => {
    // result
    expect(isOptionSelected(AlignmentLayout.topCenter, AlignmentLayout.topLeft, false, false, true)).toBe(false);
    expect(isOptionSelected(AlignmentLayout.topLeft, AlignmentLayout.topLeft, false, false, true)).toBe(true);
  });

  it('should select the whole row when isGapAutoHorizontal is true on a horizontal frame', () => {
    // result
    expect(isOptionSelected(AlignmentLayout.topCenter, AlignmentLayout.topLeft, false, true, true)).toBe(true);
    expect(isOptionSelected(AlignmentLayout.topRight, AlignmentLayout.topLeft, false, true, true)).toBe(true);
    expect(isOptionSelected(AlignmentLayout.left, AlignmentLayout.topLeft, false, true, true)).toBe(false);
  });

  it('should ignore isGapAutoVertical on a horizontal frame', () => {
    // result
    expect(isOptionSelected(AlignmentLayout.topCenter, AlignmentLayout.topLeft, true, false, true)).toBe(false);
  });
});
