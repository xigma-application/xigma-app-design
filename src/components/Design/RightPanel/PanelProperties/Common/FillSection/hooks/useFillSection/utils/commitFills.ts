// store
import { AppDispatch } from 'store/store';
import { updateNode, updateNodes } from 'store/design/slice';

// types
import { StrokeAlign } from 'types/design/enums';
import { TPaint, TPaintProperty } from 'types/design/paint/types';

// utils
import { getPaintsChange } from 'utils/design/paint/getPaintsChange';

const DEFAULT_STROKE_WIDTH = 1;
const DEFAULT_STROKE_ALIGN = StrokeAlign.inside;

export type TStrokeSettings = { strokeAlign?: StrokeAlign; strokeWidth?: number };

export type TFillTarget = TStrokeSettings & { id: string };

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
  targets: TFillTarget[],
  nextFills: TPaint[],
  property: TPaintProperty = 'fills',
): void => {
  const updates = targets.map(({ id, ...stroke }) => ({
    changes: { ...getPaintsChange(property, nextFills), ...getStrokeDefaults(property, stroke) },
    id,
  }));

  if (updates.length === 1) {
    dispatch(updateNode(updates[0]));
  } else if (updates.length > 1) {
    dispatch(updateNodes(updates));
  }
};
