// others
import { DISTANCE_GUIDE_STROKE, VECTOR_CUT_CROSSING_FILL, VECTOR_VERTEX_SELECTED_FILL } from 'constant/canvas';

export const getSelectedVertexInnerFill = (isNew: boolean, isMeasuring: boolean): string => {
  if (isNew) {
    return VECTOR_CUT_CROSSING_FILL;
  }

  return isMeasuring ? DISTANCE_GUIDE_STROKE : VECTOR_VERTEX_SELECTED_FILL;
};
