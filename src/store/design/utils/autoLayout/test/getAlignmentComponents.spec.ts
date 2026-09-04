// types
import { AlignmentLayout } from 'types/design/enums';

// utils
import { getAlignmentComponents } from '../getAlignmentComponents';

describe('getAlignmentComponents', () => {
  it.each([
    [AlignmentLayout.topLeft, { x: 'start', y: 'start' }],
    [AlignmentLayout.topCenter, { x: 'center', y: 'start' }],
    [AlignmentLayout.topRight, { x: 'end', y: 'start' }],
    [AlignmentLayout.left, { x: 'start', y: 'center' }],
    [AlignmentLayout.center, { x: 'center', y: 'center' }],
    [AlignmentLayout.right, { x: 'end', y: 'center' }],
    [AlignmentLayout.bottomLeft, { x: 'start', y: 'end' }],
    [AlignmentLayout.bottomCenter, { x: 'center', y: 'end' }],
    [AlignmentLayout.bottomRight, { x: 'end', y: 'end' }],
  ] as const)('should resolve %s to %o', (alignment, expected) => {
    expect(getAlignmentComponents(alignment)).toEqual(expected);
  });
});
