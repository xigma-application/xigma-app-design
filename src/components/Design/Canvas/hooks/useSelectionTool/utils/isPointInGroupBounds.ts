// types
import { TPoint } from 'types/canvas';
import { TSceneNode } from 'types/design/types';

// utils
import { getSelectionBounds } from '../../../utils/getSelectionBounds';
import { getSelectionGroups } from '../../../utils/getSelectionGroups';
import { isGroupSelection } from '../../../utils/isGroupSelection';
import { isPointInRect } from '../../../utils/isPointInRect';

export const isPointInGroupBounds = (point: TPoint, nodes: TSceneNode[]): boolean =>
  getSelectionGroups(nodes).some((group) => isGroupSelection(group) && isPointInRect(point, getSelectionBounds(group)));
