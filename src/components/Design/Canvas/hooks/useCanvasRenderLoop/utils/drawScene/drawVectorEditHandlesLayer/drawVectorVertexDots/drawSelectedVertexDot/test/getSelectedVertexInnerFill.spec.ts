// others
import { DISTANCE_GUIDE_STROKE, VECTOR_CUT_CROSSING_FILL, VECTOR_VERTEX_SELECTED_FILL } from 'constant/canvas';

// utils
import { getSelectedVertexInnerFill } from '../getSelectedVertexInnerFill';

describe('getSelectedVertexInnerFill', () => {
  it('should return the selected-blue fill for an ordinary selected vertex', () => {
    expect(getSelectedVertexInnerFill(false, false)).toBe(VECTOR_VERTEX_SELECTED_FILL);
  });

  it('should return the cut-crossing pink for a brand-new vertex, regardless of measuring state', () => {
    expect(getSelectedVertexInnerFill(true, false)).toBe(VECTOR_CUT_CROSSING_FILL);
    expect(getSelectedVertexInnerFill(true, true)).toBe(VECTOR_CUT_CROSSING_FILL);
  });

  it('should return the distance-guide orange for the measurement anchor', () => {
    expect(getSelectedVertexInnerFill(false, true)).toBe(DISTANCE_GUIDE_STROKE);
  });
});
