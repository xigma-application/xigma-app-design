// types
import { AlignmentLayout } from 'types/design/enums';

// utils
import { isBaselineOptionSelected } from '../isBaselineOptionSelected';

describe('isBaselineOptionSelected', () => {
  it('should select the option that matches the value main axis', () => {
    // result
    expect(isBaselineOptionSelected(AlignmentLayout.right, AlignmentLayout.bottomRight)).toBe(true);
    expect(isBaselineOptionSelected(AlignmentLayout.left, AlignmentLayout.bottomRight)).toBe(false);
  });

  it('should map every vertical variant to its horizontal main axis', () => {
    // result
    expect(isBaselineOptionSelected(AlignmentLayout.center, AlignmentLayout.topCenter)).toBe(true);
    expect(isBaselineOptionSelected(AlignmentLayout.left, AlignmentLayout.topLeft)).toBe(true);
    expect(isBaselineOptionSelected(AlignmentLayout.right, AlignmentLayout.center)).toBe(false);
  });

  it('should select every option when locked', () => {
    // result
    expect(isBaselineOptionSelected(AlignmentLayout.left, AlignmentLayout.right, true)).toBe(true);
    expect(isBaselineOptionSelected(AlignmentLayout.center, AlignmentLayout.right, true)).toBe(true);
    expect(isBaselineOptionSelected(AlignmentLayout.right, AlignmentLayout.right, true)).toBe(true);
  });
});
