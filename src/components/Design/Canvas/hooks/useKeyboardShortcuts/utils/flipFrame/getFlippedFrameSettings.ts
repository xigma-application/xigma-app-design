// others
import { MIRRORED_LAYOUT_ALIGNMENT } from './constants';

// types
import { AlignmentLayout } from 'types/design/enums';
import { TFlipAxis } from './types';
import { TFrameNode, TSceneNodeChanges } from 'types/design/types';

// utils
import { getMirroredFrameGuides } from './getMirroredFrameGuides';
import { getMirroredLayoutGuides } from './getMirroredLayoutGuides';

const getMirroredRotation = (rotation: number): number => (rotation === 0 ? 0 : (360 - (rotation % 360)) % 360);

export const getFlippedFrameSettings = (frame: TFrameNode, axis: TFlipAxis): TSceneNodeChanges => {
  const layoutAlignment = MIRRORED_LAYOUT_ALIGNMENT[axis][frame.layoutAlignment ?? AlignmentLayout.topLeft];
  const guides = getMirroredFrameGuides(frame, axis);
  const layoutGuides = getMirroredLayoutGuides(frame.layoutGuides, axis);

  return axis === 'horizontal'
    ? {
        cornerRadiusBottomLeft: frame.cornerRadiusBottomRight,
        cornerRadiusBottomRight: frame.cornerRadiusBottomLeft,
        cornerRadiusTopLeft: frame.cornerRadiusTopRight,
        cornerRadiusTopRight: frame.cornerRadiusTopLeft,
        gridColumnSizes: frame.gridColumnSizes ? [...frame.gridColumnSizes].reverse() : undefined,
        guides,
        layoutAlignment,
        layoutGuides,
        paddingLeft: frame.paddingRight,
        paddingRight: frame.paddingLeft,
        rotation: getMirroredRotation(frame.rotation),
        strokeLeftWidth: frame.strokeRightWidth,
        strokeRightWidth: frame.strokeLeftWidth,
      }
    : {
        cornerRadiusBottomLeft: frame.cornerRadiusTopLeft,
        cornerRadiusBottomRight: frame.cornerRadiusTopRight,
        cornerRadiusTopLeft: frame.cornerRadiusBottomLeft,
        cornerRadiusTopRight: frame.cornerRadiusBottomRight,
        gridRowSizes: frame.gridRowSizes ? [...frame.gridRowSizes].reverse() : undefined,
        guides,
        layoutAlignment,
        layoutGuides,
        paddingBottom: frame.paddingTop,
        paddingTop: frame.paddingBottom,
        rotation: getMirroredRotation(frame.rotation),
        strokeBottomWidth: frame.strokeTopWidth,
        strokeTopWidth: frame.strokeBottomWidth,
      };
};
