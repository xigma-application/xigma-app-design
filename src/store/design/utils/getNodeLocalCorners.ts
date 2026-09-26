// types
import { NodeType } from 'types/design/enums';
import { TPoint } from 'types/canvas';
import { TSceneNode } from 'types/design/types';

// utils
import { getNodeWorldCorners } from './getNodeWorldCorners';
import { getRectCorners } from 'utils/canvas/getRectCorners';
import { getRenderedVectorNode } from 'utils/canvas/render/getRenderedVectorNode';
import { getVectorNodeBounds } from 'utils/canvas/vectorNetwork/getVectorNodeBounds';
import { rotatePoint } from 'utils/math/rotatePoint';
import { rotateVectorNodeOrigin } from 'components/Design/Canvas/utils/rotateVectorNodeOrigin';

const ORIGIN: TPoint = { x: 0, y: 0 };

export const getNodeLocalCorners = (node: TSceneNode, rotation: number): TPoint[] =>
  node.type === NodeType.vector
    ? getRectCorners(getVectorNodeBounds(rotateVectorNodeOrigin(getRenderedVectorNode(node), ORIGIN, -rotation)))
    : getNodeWorldCorners(node).map((corner) => rotatePoint(corner, ORIGIN, -rotation));
