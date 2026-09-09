// utils
import { getWrapRowJustifyContent } from '../getWrapRowJustifyContent';

// types
import { AlignmentLayout } from 'types/design/enums';

describe('getWrapRowJustifyContent', () => {
  it('should center a center-column alignment', () => {
    // result
    expect(getWrapRowJustifyContent(AlignmentLayout.topCenter)).toBe('center');
    expect(getWrapRowJustifyContent(AlignmentLayout.center)).toBe('center');
    expect(getWrapRowJustifyContent(AlignmentLayout.bottomCenter)).toBe('center');
  });

  it('should end-align a right-column alignment', () => {
    // result
    expect(getWrapRowJustifyContent(AlignmentLayout.topRight)).toBe('flex-end');
    expect(getWrapRowJustifyContent(AlignmentLayout.right)).toBe('flex-end');
    expect(getWrapRowJustifyContent(AlignmentLayout.bottomRight)).toBe('flex-end');
  });

  it('should start-align a left-column alignment', () => {
    // result
    expect(getWrapRowJustifyContent(AlignmentLayout.topLeft)).toBe('flex-start');
    expect(getWrapRowJustifyContent(AlignmentLayout.left)).toBe('flex-start');
    expect(getWrapRowJustifyContent(AlignmentLayout.bottomLeft)).toBe('flex-start');
  });
});
