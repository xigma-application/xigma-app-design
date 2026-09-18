// store
import { AppDispatch } from 'store/store';
import { updateNode } from 'store/design/slice';

// types
import { TPaint, TPaintProperty } from 'types/design/paint/types';

// utils
import { getPaintsChange } from 'utils/design/paint/getPaintsChange';

const DEFAULT_STROKE_WIDTH = 1;

export const commitFills = (
  dispatch: AppDispatch,
  nodeId: string | undefined,
  nextFills: TPaint[],
  property: TPaintProperty = 'fills',
  currentStrokeWidth: number | undefined = undefined,
): void => {
  if (nodeId) {
    const needsStrokeWidth = property === 'strokes' && currentStrokeWidth === undefined;

    dispatch(
      updateNode({
        changes: needsStrokeWidth
          ? { ...getPaintsChange(property, nextFills), strokeWidth: DEFAULT_STROKE_WIDTH }
          : getPaintsChange(property, nextFills),
        id: nodeId,
      }),
    );
  }
};
