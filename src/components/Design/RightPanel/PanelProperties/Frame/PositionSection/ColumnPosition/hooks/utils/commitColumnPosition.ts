// store
import { AppDispatch } from 'store';
import { updateNode } from 'store/design/slice';

// utils
import { getNodeAbsoluteFromParentPosition } from 'store/design/utils/getNodeAbsoluteFromParentPosition';

type TParent = Parameters<typeof getNodeAbsoluteFromParentPosition>[1];

export const commitColumnPosition = (
  dispatch: AppDispatch,
  id: string,
  parent: TParent | undefined,
  nextX: number,
  nextY: number,
): void => {
  if (parent) {
    const absolute = getNodeAbsoluteFromParentPosition({ x: nextX, y: nextY }, parent);
    dispatch(updateNode({ changes: { x: Math.round(absolute.x), y: Math.round(absolute.y) }, id }));
  } else {
    dispatch(updateNode({ changes: { x: nextX, y: nextY }, id }));
  }
};
