// others
import { DEFAULT_SHAPE_SIZE } from '../../constants';

// types
import { NodeType } from 'types/design/enums';
import { TPoint } from 'types/canvas';
import { TRectangleNode } from 'types/design/types';

export const PENDING_NEW_NODE_ID = '__pending-new-node__';

export const buildPendingNewNodePlaceholder = (point: TPoint): TRectangleNode => ({
  fills: [],
  height: DEFAULT_SHAPE_SIZE,
  id: PENDING_NEW_NODE_ID,
  name: '',
  parentId: null,
  rotation: 0,
  type: NodeType.rectangle,
  width: DEFAULT_SHAPE_SIZE,
  x: point.x - DEFAULT_SHAPE_SIZE / 2,
  y: point.y - DEFAULT_SHAPE_SIZE / 2,
});
