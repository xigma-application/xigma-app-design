// types
import { TPoint } from 'types/canvas';
import { TSceneNode } from 'types/design/types';

// utils
import { getSelectionBounds } from '../../../utils/getSelectionBounds';
import { isGroupSelection } from '../../../utils/isGroupSelection';
import { isPointInRect } from '../../../utils/isPointInRect';

export const isPointInGroupBounds = (point: TPoint, nodes: TSceneNode[]): boolean =>
  isGroupSelection(nodes) && isPointInRect(point, getSelectionBounds(nodes));
