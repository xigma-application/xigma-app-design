// types
import { AlignmentLayout, SizingMode } from 'types/design/enums';
import { TFrameNode } from 'types/design/types';

// utils
import { getFlippedFrameSettings } from '../getFlippedFrameSettings';

vi.mock('../getMirroredFrameGuides', () => ({ getMirroredFrameGuides: (): string => 'guides' }));
vi.mock('../getMirroredLayoutGuides', () => ({ getMirroredLayoutGuides: (): string => 'layout-guides' }));

const frame = {
  cornerRadiusBottomLeft: 1,
  cornerRadiusBottomRight: 2,
  cornerRadiusTopLeft: 3,
  cornerRadiusTopRight: 4,
  gridColumnSizes: [{ mode: SizingMode.fixed, value: 1 }, { mode: SizingMode.fill }],
  gridRowSizes: [{ mode: SizingMode.fill }, { mode: SizingMode.fixed, value: 2 }],
  layoutAlignment: AlignmentLayout.topLeft,
  paddingBottom: 5,
  paddingLeft: 6,
  paddingRight: 7,
  paddingTop: 8,
  rotation: 30,
  strokeBottomWidth: 9,
  strokeLeftWidth: 10,
  strokeRightWidth: 11,
  strokeTopWidth: 12,
} as TFrameNode;

describe('getFlippedFrameSettings', () => {
  it('should swap the left and right settings, mirror the rotation and reverse the columns for a horizontal flip', () => {
    // result
    expect(getFlippedFrameSettings(frame, 'horizontal')).toEqual({
      cornerRadiusBottomLeft: 2,
      cornerRadiusBottomRight: 1,
      cornerRadiusTopLeft: 4,
      cornerRadiusTopRight: 3,
      gridColumnSizes: [{ mode: SizingMode.fill }, { mode: SizingMode.fixed, value: 1 }],
      guides: 'guides',
      layoutAlignment: AlignmentLayout.topRight,
      layoutGuides: 'layout-guides',
      paddingLeft: 7,
      paddingRight: 6,
      rotation: 330,
      strokeLeftWidth: 11,
      strokeRightWidth: 10,
    });
  });

  it('should swap the top and bottom settings and reverse the rows for a vertical flip', () => {
    // result
    expect(getFlippedFrameSettings(frame, 'vertical')).toEqual({
      cornerRadiusBottomLeft: 3,
      cornerRadiusBottomRight: 4,
      cornerRadiusTopLeft: 1,
      cornerRadiusTopRight: 2,
      gridRowSizes: [{ mode: SizingMode.fixed, value: 2 }, { mode: SizingMode.fill }],
      guides: 'guides',
      layoutAlignment: AlignmentLayout.bottomLeft,
      layoutGuides: 'layout-guides',
      paddingBottom: 8,
      paddingTop: 5,
      rotation: 330,
      strokeBottomWidth: 12,
      strokeTopWidth: 9,
    });
  });

  it('should keep a zero rotation, default to top-left alignment and skip missing grid sizes', () => {
    // mock
    const plain = { rotation: 0 } as TFrameNode;

    // result
    expect(getFlippedFrameSettings(plain, 'horizontal')).toMatchObject({
      gridColumnSizes: undefined,
      layoutAlignment: AlignmentLayout.topRight,
      rotation: 0,
    });
    expect(getFlippedFrameSettings(plain, 'vertical')).toMatchObject({ gridRowSizes: undefined });
  });
});
