// utils
import { buildFlowReorderCandidateIds } from '../buildFlowReorderCandidateIds';

describe('buildFlowReorderCandidateIds', () => {
  it('should splice a single moved id before the anchor', () => {
    expect(buildFlowReorderCandidateIds(['a', 'b', 'c'], ['a'], 'c', 'before')).toEqual(['b', 'a', 'c']);
  });

  it('should splice a single moved id after the anchor', () => {
    expect(buildFlowReorderCandidateIds(['a', 'b', 'c'], ['a'], 'c', 'after')).toEqual(['b', 'c', 'a']);
  });

  it('should keep a multi-id block together and in its own relative order', () => {
    expect(buildFlowReorderCandidateIds(['a', 'b', 'c', 'd', 'e'], ['a', 'b'], 'e', 'after')).toEqual(['c', 'd', 'e', 'a', 'b']);
  });

  it('should append at the end when the anchor is the last remaining id and position is "after"', () => {
    expect(buildFlowReorderCandidateIds(['a', 'b', 'c'], ['b'], 'c', 'after')).toEqual(['a', 'c', 'b']);
  });
});
