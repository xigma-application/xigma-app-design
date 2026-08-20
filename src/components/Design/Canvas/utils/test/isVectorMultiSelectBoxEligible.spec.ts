// utils
import { isVectorMultiSelectBoxEligible } from '../isVectorMultiSelectBoxEligible';

describe('isVectorMultiSelectBoxEligible', () => {
  it('should return true for 2+ selected vertices and no selected tangent handles', () => {
    // result
    expect(isVectorMultiSelectBoxEligible(['v1', 'v2'], [])).toBe(true);
  });

  it('should return false when any tangent handle is selected, even alongside 2+ vertices', () => {
    // result
    expect(isVectorMultiSelectBoxEligible(['v1', 'v2'], [{ end: 'start', segmentId: 's1' }])).toBe(false);
  });

  it('should return false for a single selected vertex and no handles', () => {
    // result
    expect(isVectorMultiSelectBoxEligible(['v1'], [])).toBe(false);
  });

  it('should return false for an empty selection', () => {
    // result
    expect(isVectorMultiSelectBoxEligible([], [])).toBe(false);
  });
});
