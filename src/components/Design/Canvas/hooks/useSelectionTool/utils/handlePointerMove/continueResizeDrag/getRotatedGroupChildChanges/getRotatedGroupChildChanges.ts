// types
import { TDraftRect } from 'types/canvas';
import { TResizeNodeOrigin } from 'types/design/selectionTool/types';
import { TSceneNodeChanges } from 'types/design/types';

// utils
import { getGroupBoxChildChanges } from './getGroupBoxChildChanges';
import { getGroupLineChildChanges } from './getGroupLineChildChanges';
import { getGroupVectorChildChanges } from './getGroupVectorChildChanges';
import { getMirrorSigns } from './getMirrorSigns';
import { getNextGroupChildPoint } from './getNextGroupChildPoint';

export const getRotatedGroupChildChanges = (
  childOrigin: TResizeNodeOrigin,
  groupOrigin: TDraftRect,
  groupRotation: number,
  newGroupBox: TDraftRect,
): TSceneNodeChanges => {
  const mirror = getMirrorSigns(groupOrigin, newGroupBox, groupRotation);
  const nextPoint = getNextGroupChildPoint(groupOrigin, groupRotation, newGroupBox, mirror);

  switch (true) {
    case 'x1' in childOrigin:
      return getGroupLineChildChanges(childOrigin, nextPoint);
    case 'vertices' in childOrigin:
      return getGroupVectorChildChanges(childOrigin, nextPoint);
    default:
      return getGroupBoxChildChanges(childOrigin, groupOrigin, groupRotation, newGroupBox, mirror, nextPoint);
  }
};
