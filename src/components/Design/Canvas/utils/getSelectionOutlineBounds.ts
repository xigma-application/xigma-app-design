// types
import { TDraftRect } from 'types/canvas';
import { TSceneNode } from 'types/design/types';

// utils
import { getNodeBounds } from './getNodeBounds';
import { getPaddedRect } from 'utils/design/stroke/getPaddedRect';
import { getStrokePaddings } from 'utils/design/stroke/getStrokePaddings';

export const getSelectionOutlineBounds = (node: TSceneNode): TDraftRect => getPaddedRect(getNodeBounds(node), getStrokePaddings(node));
