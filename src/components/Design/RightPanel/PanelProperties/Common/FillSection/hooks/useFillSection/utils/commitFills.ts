// store
import { AppDispatch } from 'store/store';
import { updateNode } from 'store/design/slice';

// types
import { StrokeAlign } from 'types/design/enums';
import { TPaint, TPaintProperty } from 'types/design/paint/types';

// utils
import { getPaintsChange } from 'utils/design/paint/getPaintsChange';

const DEFAULT_STROKE_WIDTH = 1;
const DEFAULT_STROKE_ALIGN = StrokeAlign.inside;

export type TStrokeSettings = { strokeAlign?: StrokeAlign; strokeWidth?: number };

const getStrokeDefaults = (property: TPaintProperty, current: TStrokeSettings): TStrokeSettings => {
  if (property === 'strokes') {
    return {
      strokeAlign: current.strokeAlign ?? DEFAULT_STROKE_ALIGN,
      strokeWidth: current.strokeWidth ?? DEFAULT_STROKE_WIDTH,
    };
  }

  return {};
};

export const commitFills = (
  dispatch: AppDispatch,
  nodeId: string | undefined,
  nextFills: TPaint[],
  property: TPaintProperty = 'fills',
  currentStroke: TStrokeSettings = {},
): void => {
  if (nodeId) {
    dispatch(
      updateNode({ changes: { ...getPaintsChange(property, nextFills), ...getStrokeDefaults(property, currentStroke) }, id: nodeId }),
    );
  }
};
