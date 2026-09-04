// utils
import { getOptionViewModifiers } from '../getOptionViewModifiers';

// types
import { AlignmentLayout } from 'types/design/enums';

describe('getOptionViewModifiers', () => {
  it('should return the vertical axis with no cross-axis modifier for the left column', () => {
    // action
    const modifiers = getOptionViewModifiers(AlignmentLayout.left, false, false, false);

    // result
    expect(modifiers).toEqual(['vertical']);
  });

  it('should return the vertical axis with the center cross-axis modifier for the center column', () => {
    // action
    const modifiers = getOptionViewModifiers(AlignmentLayout.center, false, false, false);

    // result
    expect(modifiers).toEqual(['vertical', 'center']);
  });

  it('should return the vertical axis with the end cross-axis modifier for the right column', () => {
    // action
    const modifiers = getOptionViewModifiers(AlignmentLayout.right, false, false, false);

    // result
    expect(modifiers).toEqual(['vertical', 'end']);
  });

  it('should return the vertical-auto axis when isGapAutoVertical is true', () => {
    // action
    const modifiers = getOptionViewModifiers(AlignmentLayout.topCenter, false, true, false);

    // result
    expect(modifiers).toEqual(['vertical-auto', 'center']);
  });

  it('should not switch to vertical-auto when only isGapAutoHorizontal is true', () => {
    // action
    const modifiers = getOptionViewModifiers(AlignmentLayout.topCenter, false, false, true);

    // result
    expect(modifiers).toEqual(['vertical', 'center']);
  });

  it('should add the short modifier for the middle row (left, center, right) in vertical-auto mode', () => {
    // result
    expect(getOptionViewModifiers(AlignmentLayout.left, false, true, false)).toEqual(['vertical-auto', 'short']);
    expect(getOptionViewModifiers(AlignmentLayout.center, false, true, false)).toEqual(['vertical-auto', 'center', 'short']);
    expect(getOptionViewModifiers(AlignmentLayout.right, false, true, false)).toEqual(['vertical-auto', 'end', 'short']);
  });

  it('should not add the short modifier for the middle row outside vertical-auto mode', () => {
    // result
    expect(getOptionViewModifiers(AlignmentLayout.center, false, false, false)).toEqual(['vertical', 'center']);
  });

  it('should return the horizontal axis when not gap-auto', () => {
    // action
    const modifiers = getOptionViewModifiers(AlignmentLayout.topLeft, true, false, false);

    // result
    expect(modifiers).toEqual(['horizontal']);
  });

  it('should return the end cross-axis modifier for the bottom row when horizontal', () => {
    // action
    const modifiers = getOptionViewModifiers(AlignmentLayout.bottomCenter, true, false, false);

    // result
    expect(modifiers).toEqual(['horizontal', 'end']);
  });

  it('should return the horizontal-auto axis when isGapAutoHorizontal is true', () => {
    // action
    const modifiers = getOptionViewModifiers(AlignmentLayout.topLeft, true, false, true);

    // result
    expect(modifiers).toEqual(['horizontal-auto']);
  });

  it('should not switch to horizontal-auto when only isGapAutoVertical is true', () => {
    // action
    const modifiers = getOptionViewModifiers(AlignmentLayout.topLeft, true, true, false);

    // result
    expect(modifiers).toEqual(['horizontal']);
  });

  it('should add the short modifier for the middle column (topCenter, center, bottomCenter) in horizontal-auto mode', () => {
    // result
    expect(getOptionViewModifiers(AlignmentLayout.topCenter, true, false, true)).toEqual(['horizontal-auto', 'short']);
    expect(getOptionViewModifiers(AlignmentLayout.center, true, false, true)).toEqual(['horizontal-auto', 'center', 'short']);
    expect(getOptionViewModifiers(AlignmentLayout.bottomCenter, true, false, true)).toEqual(['horizontal-auto', 'end', 'short']);
  });

  it('should not add the short modifier for the middle column outside horizontal-auto mode', () => {
    // result
    expect(getOptionViewModifiers(AlignmentLayout.center, true, false, false)).toEqual(['horizontal', 'center']);
  });
});
