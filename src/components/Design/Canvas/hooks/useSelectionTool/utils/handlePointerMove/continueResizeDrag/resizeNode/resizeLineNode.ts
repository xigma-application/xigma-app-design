// store
import { updateNode } from 'store/design/slice';
import { AppDispatch } from 'store';

// types
import { TResizeNodeOrigin } from '../../../../types';

// utils
import { transformCoord } from '../transformCoord';

export const resizeLineNode = (
  id: string,
  origin: Extract<TResizeNodeOrigin, { x1: number }>,
  dispatch: AppDispatch,
  anchors: { x: number | null; y: number | null },
  scaleX: number,
  scaleY: number,
): void => {
  dispatch(
    updateNode({
      changes: {
        x1: Math.round(transformCoord(origin.x1, anchors.x, scaleX)),
        x2: Math.round(transformCoord(origin.x2, anchors.x, scaleX)),
        y1: Math.round(transformCoord(origin.y1, anchors.y, scaleY)),
        y2: Math.round(transformCoord(origin.y2, anchors.y, scaleY)),
      },
      id,
    }),
  );
};
